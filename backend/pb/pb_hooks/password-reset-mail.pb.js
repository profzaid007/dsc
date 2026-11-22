// Validate syntax and service readiness independently of account existence.
// PocketBase returns the same reset success for known and unknown addresses.
routerUse(e => {
 if (e.request.method !== "POST" || e.request.url.path !== "/api/collections/users/request-password-reset") return e.next()
 const raw = e.requestInfo().body.email
 const email = typeof raw === "string" ? raw.trim().toLowerCase() : ""
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return e.json(400,{code:"password_reset_email_invalid",message:"Enter a valid email address, such as name@example.com."})
 const smtp = e.app.settings().smtp
 if (!smtp.enabled || !smtp.host || smtp.host === "smtp.example.com") return e.json(503,{code:"password_reset_email_unavailable",message:"Password reset email is temporarily unavailable. Please try again later."})
 return e.next()
})
