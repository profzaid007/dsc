routerAdd(
  "GET",
  "/api/dsc/training-registrations",
  (e) => require(__hooks + "/lib/training-registrations.js")(e, "list"),
  $apis.requireAuth("users")
)
routerAdd(
  "PATCH",
  "/api/dsc/training-registrations/{id}",
  (e) => require(__hooks + "/lib/training-registrations.js")(e, "update"),
  $apis.requireAuth("users")
)
routerAdd(
  "DELETE",
  "/api/dsc/training-registrations/{id}",
  (e) => require(__hooks + "/lib/training-registrations.js")(e, "delete"),
  $apis.requireAuth("users")
)
