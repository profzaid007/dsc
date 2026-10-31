// Keep the existing email content, changing only the obsolete dashboard URL.
migrate(app => {
  const users = app.findCollectionByNameOrId("users")
  const template = users.resetPasswordTemplate
  const updated = template.body.replace(
    /\{APP_URL\}\/_\/#\/auth\/confirm-password-reset\/\{TOKEN\}/g,
    "{APP_URL}/reset-password?token={TOKEN}"
  )
  if (updated !== template.body) {
    template.body = updated
    app.save(users)
  }
}, () => {
  // Retain the working link when rolling back unrelated application changes.
})
