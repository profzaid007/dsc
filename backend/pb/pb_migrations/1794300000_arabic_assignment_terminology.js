// Update stored Arabic permission labels without changing permission keys or grants.
migrate(app => {
  const oldLabel = "التعيينات";
  const newLabel = "التكليفات";
  for (const record of app.findAllRecords("security_permissions")) {
    const label = record.getString("name_ar");
    if (!label.includes(oldLabel)) continue;
    record.set("name_ar", label.split(oldLabel).join(newLabel));
    app.save(record);
  }
}, () => {
  // Keep the corrected Arabic terminology on rollback.
});
