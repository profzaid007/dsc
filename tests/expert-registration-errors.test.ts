import { test } from "node:test"
import assert from "node:assert/strict"
import { ClientResponseError } from "pocketbase"
import { getFieldErrors, getErrorMessage } from "../lib/pb"

test("registration errors retain field labels and every validation detail", () => {
  const error = new ClientResponseError({ status: 400, response: {
    message: "Please correct the highlighted expert application fields.",
    data: {
      email: { code: "validation_not_unique", message: "Already exists" },
      cv: { code: "validation_invalid_mime_type", message: "File must be a PDF." },
    },
  } })
  assert.deepEqual(getFieldErrors(error, "en"), {
    email: "This email address is already in use.", cv: "File must be a PDF.",
  })
  assert.match(getErrorMessage(error, "en"), /email address:.*already in use/)
  assert.match(getErrorMessage(error, "en"), /CV attachment: File must be a PDF/)
  assert.match(getErrorMessage(error, "ar"), /البريد الإلكتروني/)
})

test("custom registration explanations replace the generic request error", () => {
  const error = new ClientResponseError({ status: 400, response: {
    message: "Both expert names are required", data: {},
  } })
  assert.equal(getErrorMessage(error, "en"), "Both expert names are required")
})
