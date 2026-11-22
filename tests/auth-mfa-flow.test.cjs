const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const ts = require("typescript")

function fixture() {
  let record = null
  const calls = []
  const pb = {
    authStore: { clear() { record = null } },
    collection(name) {
      assert.equal(name, "users")
      return {
        async requestOTP(email) { calls.push(["otp", email]); return { otpId: "otp-fixture" } },
        async authWithOTP(id, code, options) {
          calls.push(["verify", id, code, options])
          if (code !== "12345678") throw { status: 400 }
          record = { id: "fixture", role: "admin", is_active: true }
          return { record }
        },
      }
    },
  }
  const mocks = {
    react: { useState: value => [value, () => {}], useEffect() {}, useCallback: fn => fn },
    "@/lib/current-lang": { getCurrentLang: () => "en" },
    "@/lib/i18n": { t: (value, lang) => value[lang] },
    "@/lib/pb": {
      __esModule: true, default: pb,
      getCurrentUser: () => record,
      getErrorMessage: () => "Unable to authenticate",
      isAuthenticated: () => !!record,
      isAdmin: () => record?.role === "admin",
      isSuperAdmin: () => false,
      logout: async () => pb.authStore.clear(),
      authWithPassword: async () => { throw { status: 401, response: { mfaId: "mfa-fixture" } } },
    },
  }
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync("hooks/useAuth.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  new Function("exports", "require", source)(exports, name => { assert.ok(mocks[name], name); return mocks[name] })
  return { auth: exports.useAuth(), calls, getRecord: () => record }
}

test("password MFA challenge sends an OTP without establishing an authenticated user", async () => {
  const f = fixture()
  const result = await f.auth.login("admin@example.test", "fixture-password")
  assert.equal(result.success, false)
  assert.equal(result.mfaId, "mfa-fixture")
  assert.equal(result.otpId, "otp-fixture")
  assert.equal(f.getRecord(), null)
  assert.deepEqual(f.calls, [["otp", "admin@example.test"]])
})

test("MFA completion binds the OTP to its challenge and rejects invalid codes", async () => {
  const f = fixture()
  const challenge = { otpId: "otp-fixture", mfaId: "mfa-fixture" }
  assert.equal((await f.auth.login("admin@example.test", "", { ...challenge, code: "00000000" })).success, false)
  assert.equal(f.getRecord(), null)
  const result = await f.auth.login("admin@example.test", "", { ...challenge, code: "12345678" })
  assert.equal(result.success, true)
  assert.equal(result.role, "admin")
  assert.deepEqual(f.calls.at(-1), ["verify", "otp-fixture", "12345678", { mfaId: "mfa-fixture" }])
})
