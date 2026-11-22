// A deliberate sign-out revokes all devices, including copied/stolen tokens.
routerAdd("POST", "/api/dsc/auth/logout", e => {
  e.app.runInTransaction(app => {
    const user = app.findRecordById("users", e.auth.id)
    user.refreshTokenKey()
    app.save(user)
  })
  return e.noContent(204)
}, $apis.requireAuth("users"))
