// Check server mail setup before looking up the email, so both existing and unknown accounts receive the same setup response.
routerUse(e => {
 if (e.request.method === "POST" && e.request.url.path === "/api/collections/users/request-password-reset") {
   const smtp = e.app.settings().smtp
   if (!smtp.enabled || !smtp.host || smtp.host === "smtp.example.com") return e.json(503,{code:"password_reset_email_unavailable",message:"Password reset email is unavailable: the server email service is not configured. Contact the administrator."})
 }
 return e.next()
})
