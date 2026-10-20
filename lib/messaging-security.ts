import { createHash } from "node:crypto"
import PocketBase from "pocketbase"

export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message)
  }
}
const buckets = new Map<string, { count: number; expires: number }>()
export function takeQuota(key: string, limit: number, now = Date.now()) {
  for (const [id, entry] of buckets)
    if (entry.expires <= now) buckets.delete(id)
  const entry = buckets.get(key) ?? { count: 0, expires: now + 60_000 }
  if (entry.count >= limit)
    throw new RequestError("Too many requests. Please try again later.", 429)
  entry.count++
  buckets.set(key, entry)
}
/** Redis executes increment and expiry atomically, shared by every application instance. */
export async function sharedQuota(key: string, limit: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.DSC_LOCAL_BACKEND === "true"
    ) {
      takeQuota(key, limit)
      return
    }
    const [, scope, ...identity] = key.split(":")
    const backend =
      process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
    const response = await fetch(backend + "/api/dsc/messaging-quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, identity: identity.join(":") }),
      signal: AbortSignal.timeout(5000),
    })
    if (response.status === 429)
      throw new RequestError("Too many requests. Please try again later.", 429)
    if (!response.ok)
      throw new RequestError("Messaging quota service unavailable", 503)
    return
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      "EVAL",
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n",
      "1",
      "dsc:" + key,
    ]),
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok)
    throw new RequestError("Messaging quota service unavailable", 503)
  const data = await response.json()
  if (data.error || typeof data.result !== "number")
    throw new RequestError("Messaging quota service unavailable", 503)
  if (data.result > limit)
    throw new RequestError("Too many requests. Please try again later.", 429)
}
export async function guardMessaging(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin)
    throw new RequestError("Invalid origin", 403)
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new RequestError("JSON required", 415)
  // A process-wide ceiling also applies when no trusted proxy supplies a client IP.
  await sharedQuota("messaging:global", 30)
  const ip =
    process.env.DSC_TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      : undefined
  const platformIp =
    process.env.NETLIFY === "true"
      ? request.headers.get("x-nf-client-connection-ip")
      : undefined
  if (ip || platformIp)
    await sharedQuota(
      "messaging:client:" +
        createHash("sha256")
          .update(ip || platformIp!)
          .digest("hex"),
      5
    )
}
export async function readMessagingBody(
  request: Request,
  maxBytes = 32_768
): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader()
  if (!reader) throw new RequestError("Missing body")
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      throw new RequestError("Request too large", 413)
    }
    chunks.push(value)
  }
  let body: unknown
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } catch {
    throw new RequestError("Invalid JSON")
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new RequestError("Invalid request")
  return body as Record<string, unknown>
}
export function messageString(
  body: Record<string, unknown>,
  key: string,
  max: number,
  required = true
) {
  const value = body[key]
  if (!required && (value === undefined || value === "")) return ""
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new RequestError(`Invalid ${key}`)
  return value.trim()
}
export async function messagingUser(
  request: Request,
  adminOnly = false,
  allowPending = false
) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token || token.length > 4096)
    throw new RequestError("Authentication required", 401)
  await sharedQuota(
    "messaging:token:" + createHash("sha256").update(token).digest("hex"),
    5
  )
  const client = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
  )
  client.authStore.save(token)
  let user
  try {
    user = (
      await client
        .collection("users")
        .authRefresh({ requestKey: null, signal: AbortSignal.timeout(10_000) })
    ).record
  } catch {
    throw new RequestError("Authentication required", 401)
  }
  if (
    (!allowPending && user.is_active !== true) ||
    (adminOnly && !["admin", "super_admin"].includes(user.role))
  )
    throw new RequestError("Access denied", 403)
  if ((adminOnly || user.role === "admin") && user.role !== "super_admin") {
    try {
      const access = await client.send<{ permissions: string[] }>(
        "/api/dsc/security/me",
        { method: "GET", requestKey: null, signal: AbortSignal.timeout(10_000) }
      )
      if (!access.permissions.includes("messages.create"))
        throw new RequestError("Permission required: messages.create", 403)
    } catch (error) {
      if (error instanceof RequestError) throw error
      throw new RequestError("Unable to verify messaging permission", 403)
    }
  }
  return user
}
export function messagingError(error: unknown) {
  if (error instanceof RequestError)
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        ...(error.status === 429 ? { headers: { "Retry-After": "60" } } : {}),
      }
    )
  console.error("Messaging delivery failed")
  return Response.json(
    { error: "Unable to send your message. Please try again later." },
    { status: 500 }
  )
}
export const localMessagingDisabled = () =>
  process.env.NODE_ENV === "development" &&
  process.env.DSC_LOCAL_BACKEND === "true"
