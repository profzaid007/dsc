migrate((app) => {
  app.db().newQuery(
    "CREATE TABLE _dsc_security_role_sequence (id INTEGER PRIMARY KEY CHECK (id = 1), value INTEGER NOT NULL)"
  ).execute()
  app.db().newQuery(
    "INSERT INTO _dsc_security_role_sequence (id, value) " +
      "SELECT 1, COALESCE(MAX(CAST(substr(key, 6) AS INTEGER)), 0) " +
      "FROM security_roles WHERE key GLOB 'role-[0-9]*' AND substr(key, 6) NOT GLOB '*[^0-9]*'"
  ).execute()
}, (app) => {
  app.db().newQuery("DROP TABLE _dsc_security_role_sequence").execute()
})
