import assert from "node:assert/strict"
import { test } from "node:test"
import {
  guardMessaging,
  reserveMessagingDelivery,
  sharedQuota,
  RequestError,
} from "../lib/messaging-security"

test("quota fallback fails closed and throttled clients cannot spend delivery capacity", async (t) => {
  const keys = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "DSC_LOCAL_BACKEND", "DSC_MESSAGING_QUOTA_SECRET", "DSC_TRUST_PROXY"]
  const previous = keys.map(key => process.env[key])
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
    keys.forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key]
      else process.env[key] = previous[i]
    })
  })
  keys.forEach(key => delete process.env[key])
  let calls = 0
  globalThis.fetch = async () => { calls++; throw Error("Unexpected network call") }
  await assert.rejects(sharedQuota("messaging:global", 30), (error: unknown) => error instanceof RequestError && error.status === 503)
  assert.equal(calls, 0)

  process.env.DSC_MESSAGING_QUOTA_SECRET = "test-server-secret-at-least-32-characters"
  process.env.DSC_TRUST_PROXY = "true"
  const scopes: string[] = []
  let denied = true
  globalThis.fetch = async (_input, options) => {
    assert.equal(new Headers(options?.headers).get("X-DSC-Quota-Secret"), process.env.DSC_MESSAGING_QUOTA_SECRET)
    const body = JSON.parse(String(options?.body))
    scopes.push(body.scope)
    if (body.scope === "client") assert.match(body.identity, /^[a-f0-9]{64}$/)
    return Response.json({ allowed: !denied }, { status: denied ? 429 : 200 })
  }
  const request = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "192.0.2.1" },
    body: "{}",
  })
  for (let i = 0; i < 35; i++) {
    await assert.rejects(guardMessaging(request), (error: unknown) => error instanceof RequestError && error.status === 429)
  }
  assert.deepEqual([...new Set(scopes)], ["client"])
  denied = false
  await guardMessaging(request)
  assert.equal(scopes.includes("global"), false)
  await reserveMessagingDelivery()
  assert.equal(scopes.at(-1), "global")
})

test("Upstash enforces delivery limits without needing a PocketBase quota secret", async (t) => {
  const keys = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "DSC_MESSAGING_QUOTA_SECRET"]
  const previous = keys.map(key => process.env[key])
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
    keys.forEach((key, i) => {
      if (previous[i] === undefined) delete process.env[key]
      else process.env[key] = previous[i]
    })
  })
  process.env.UPSTASH_REDIS_REST_URL = "https://quota.example.test"
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-redis-token"
  delete process.env.DSC_MESSAGING_QUOTA_SECRET
  let count = 0
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://quota.example.test")
    assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer test-redis-token")
    assert.equal(JSON.parse(String(options?.body)).at(-1), "dsc:messaging:global")
    return Response.json({ result: ++count })
  }
  for (let i = 0; i < 30; i++) await reserveMessagingDelivery()
  await assert.rejects(reserveMessagingDelivery(), (error: unknown) => error instanceof RequestError && error.status === 429)
})
