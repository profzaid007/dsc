// Quota reservations never send mail or reveal account data. All instances use the same transaction.
routerAdd(
  "POST",
  "/api/dsc/messaging-quota",
  (e) => {
    // Only the Next.js server may reserve the shared delivery budget.
    const secret = $os.getenv("DSC_MESSAGING_QUOTA_SECRET")
    if (!secret || secret.length < 32)
      return e.json(503, { message: "Messaging quota service unavailable" })
    const supplied = e.request.header.get("X-DSC-Quota-Secret")
    if (!supplied || !$security.equal(supplied, secret))
      return e.json(403, { message: "Access denied" })
    const b = e.requestInfo().body
    if (
      !["global", "client", "token"].includes(b.scope) ||
      (b.scope !== "global" && !/^[a-f0-9]{64}$/.test(String(b.identity || "")))
    )
      throw new BadRequestError("Invalid quota")
    let denied = false
    e.app.runInTransaction((app) => {
      const now = Date.now(),
        key =
          String(b.scope) + ":" + (b.scope === "global" ? "all" : b.identity)
      const rows = app.findRecordsByFilter(
        "messaging_quotas",
        "key = {:key}",
        "",
        1,
        0,
        { key }
      )
      const row = rows.length
        ? rows[0]
        : new Record(app.findCollectionByNameOrId("messaging_quotas"))
      if (row.getFloat("expires") <= now) {
        row.set("count", 0)
        row.set("expires", now + 60000)
      }
      const count = row.getInt("count"),
        limit = b.scope === "global" ? 30 : 5
      if (count >= limit) {
        denied = true
        return
      }
      row.set("key", key)
      row.set("count", count + 1)
      app.save(row)
      // Bound old token/IP rows without touching the current reservation.
      for (const expired of app.findRecordsByFilter(
        "messaging_quotas",
        "expires < {:now}",
        "",
        50,
        0,
        { now }
      ))
        app.delete(expired)
    })
    return e.json(denied ? 429 : 200, { allowed: !denied })
  },
  $apis.bodyLimit(1024)
)
