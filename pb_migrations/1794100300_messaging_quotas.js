migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId("messaging_quotas")
      return
    } catch {}
    const c = new Collection({
      name: "messaging_quotas",
      type: "base",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "key", type: "text", required: true, max: 100 },
        { name: "count", type: "number" },
        { name: "expires", type: "number" },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_messaging_quota_key ON messaging_quotas (key)",
      ],
    })
    app.save(c)
  },
  () => {
    throw new Error("Do not remove active messaging rate limits")
  }
)
