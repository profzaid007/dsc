// Only enrich cases already authorized by PocketBase's record access rules.
onRecordEnrich((e) => {
  if (e.requestInfo && e.requestInfo.auth) {
    e.record.set("owner_display", require(__hooks + "/lib/case-owner-display.js")(e.app, e.record))
    e.record.withCustomData(true)
  }
  return e.next()
}, "cases")
