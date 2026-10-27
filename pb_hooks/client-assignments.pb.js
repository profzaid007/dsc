routerAdd("GET", "/api/dsc/my-assignments", e => require(__hooks + "/lib/client-assignments.js")(e), $apis.requireAuth("users"))
