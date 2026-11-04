const input = process.argv[2] || process.env.NEXT_PUBLIC_POCKETBASE_URL
if (!input) {
  console.error("Usage: node tools/check-client-backend.mjs <PocketBase URL>")
  process.exit(2)
}
const base = new URL(input)
if (!["https:", "http:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
  throw new Error("Use an HTTP(S) backend URL without credentials, query or fragment.")
}
if (!base.pathname.endsWith("/")) base.pathname += "/"
const checks = [["api/health", 200], ["api/dsc/my-assignments", 401], ["api/dsc/my-assessments", 401], ["api/dsc/message-contacts", 401]]
let failed = false
for (const [path, expected] of checks) {
  try {
    const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(10_000), redirect: "error" })
    const ok = response.status === expected
    failed ||= !ok
    console.log(JSON.stringify({ path: `/${path}`, expected, status: response.status, ok }))
    await response.body?.cancel()
  } catch {
    failed = true
    console.log(JSON.stringify({ path: `/${path}`, expected, ok: false, error: "Endpoint could not be checked." }))
  }
}
process.exitCode = failed ? 1 : 0
