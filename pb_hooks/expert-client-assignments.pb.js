routerAdd("GET", "/api/dsc/expert/cases/{id}/assignment-tools", e => require(__hooks + "/lib/expert-client-assignments.js").list(e), $apis.requireAuth("users"))
routerAdd("POST", "/api/dsc/expert/cases/{id}/assignments", e => require(__hooks + "/lib/expert-client-assignments.js").create(e), $apis.requireAuth("users"))
