import { test } from "node:test"
import assert from "node:assert/strict"
import { securityFailure, validSecurityAccess } from "../lib/security-failure"

test("missing backend setup is distinguished from account and connection failures", () => {
  assert.equal(securityFailure({ status: 404 }), "not_deployed")
  assert.equal(securityFailure({ status: 401 }), "session_expired")
  assert.equal(securityFailure({ status: 403 }), "account_denied")
  assert.equal(securityFailure({ status: 0 }), "unreachable")
  assert.equal(securityFailure({ status: 500 }), "service_error")
  assert.equal(securityFailure(new Error("Invalid response")), "service_error")
})

test("malformed backend responses cannot become effective access", () => {
  assert.ok(
    validSecurityAccess({ permissions: ["cases.read"], is_super_admin: false })
  )
  for (const data of [
    null,
    "Not found",
    {},
    { permissions: "*", is_super_admin: true },
    { permissions: [], is_super_admin: "true" },
    { permissions: [null], is_super_admin: false },
  ])
    assert.equal(validSecurityAccess(data), false)
})
