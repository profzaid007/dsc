const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")

function exercise(before, after, confirmation, auditFails = false) {
  let update
  const audits = []
  let saved = false
  let committed = false
  const app = {
    runInTransaction(callback) {
      callback(app)
      committed = true
    },
    findRecordById() {
      return { set() {} }
    },
    save() {},
  }
  vm.runInNewContext(
    fs.readFileSync("pb_hooks/expert-profile-sync.pb.js", "utf8"),
    {
      onRecordUpdateRequest(fn) {
        update = fn
      },
      onRecordCreateRequest() {},
      BadRequestError: Error,
      __hooks: "pb_hooks",
      require() {
        return {
          audit(...args) {
            if (auditFails) throw new Error("audit failed")
            audits.push(args)
          },
        }
      },
    }
  )
  const event = {
    app,
    auth: { id: "actor" },
    record: {
      id: "profile",
      getUploadedFiles() {
        return []
      },
      original() {
        return {
          getString() {
            return before
          },
        }
      },
      getString(key) {
        return key === "profile_photo" ? after : "expert"
      },
    },
    requestInfo() {
      return { body: { confirm_profile_photo_removal: confirmation } }
    },
    next() {
      saved = true
    },
  }
  return {
    run() {
      update(event)
    },
    audits,
    saved: () => saved,
    committed: () => committed,
  }
}

test("unconfirmed clearing is rejected before saving", () => {
  for (const confirmation of [undefined, "", "false", false]) {
    const result = exercise("portrait.jpg", "", confirmation)
    assert.throws(() => result.run(), /explicitly requested/)
    assert.equal(result.saved(), false)
    assert.equal(result.committed(), false)
  }
})

test("ordinary saves preserve photos without creating photo audit entries", () => {
  for (const photo of ["portrait.jpg", ""]) {
    const result = exercise(photo, photo)
    result.run()
    assert.equal(result.committed(), true)
    assert.equal(result.audits.length, 0)
  }
})

test("intentional removals and replacements record actor and old/new filenames", () => {
  for (const next of ["", "replacement.jpg"]) {
    const result = exercise("portrait.jpg", next, "true")
    result.run()
    assert.equal(result.committed(), true)
    const [, actor, action, collection, id, before, after] = result.audits[0]
    assert.equal(actor.id, "actor")
    assert.equal(action, next ? "expert.photo.replace" : "expert.photo.remove")
    assert.equal(collection, "expert_profiles")
    assert.equal(id, "profile")
    assert.equal(before.profile_photo, "portrait.jpg")
    assert.equal(after.profile_photo, next)
  }
})

test("audit failure propagates without committing the transaction", () => {
  const result = exercise("portrait.jpg", "", "true", true)
  assert.throws(() => result.run(), /audit failed/)
  assert.equal(result.committed(), false)
})

test("backend deployment hook matches the application hook", () => {
  assert.equal(
    fs.readFileSync("pb_hooks/expert-profile-sync.pb.js", "utf8"),
    fs.readFileSync("backend/pb/pb_hooks/expert-profile-sync.pb.js", "utf8")
  )
})
