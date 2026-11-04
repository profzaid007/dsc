migrate(app => {
  try { app.findCollectionByNameOrId("security_audit_log"); return } catch {}
  const schema = {"id": "dscsecaudit0001", "name": "security_audit_log", "type": "base", "fields": [{"name": "actor", "type": "text", "required": true, "max": 15}, {"name": "action", "type": "text", "required": true, "max": 80}, {"name": "target_type", "type": "text", "required": true, "max": 80}, {"name": "target_id", "type": "text", "required": true, "max": 100}, {"name": "before", "type": "json", "maxSize": 20000}, {"name": "after", "type": "json", "maxSize": 20000}, {"name": "created", "type": "autodate", "onCreate": true}, {"name": "updated", "type": "autodate", "onCreate": true, "onUpdate": true}], "indexes": ["CREATE INDEX idx_security_audit_created ON security_audit_log (created)"], "listRule": null, "viewRule": null, "createRule": null, "updateRule": null, "deleteRule": null}
  const collection = new Collection(schema)
  app.save(collection)
}, () => { throw new Error("Do not remove expert approval audit history") })
