// Validate reset requests before PocketBase's default account lookup masks missing emails.
// The user-facing product explicitly reports an unregistered email address.
routerUse(e => {
 if (e.request.method !== "POST" || e.request.url.path !== "/api/collections/users/request-password-reset") return e.next()
 const raw = e.requestInfo().body.email
 const email = typeof raw === "string" ? raw.trim().toLowerCase() : ""
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return e.json(400,{code:"password_reset_email_invalid",message:"Enter a valid email address, such as name@example.com."})
 const users = e.app.findRecordsByFilter("users", "email = {:email}", "", 1, 0, {email})
 if (!users.length) return e.json(404,{code:"password_reset_email_not_registered",message:"This email address is not registered."})
 const smtp = e.app.settings().smtp
 if (!smtp.enabled || !smtp.host || smtp.host === "smtp.example.com") return e.json(503,{code:"password_reset_email_unavailable",message:"Password reset email is unavailable: the server email service is not configured. Contact the administrator."})
 return e.next()
})
