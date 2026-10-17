module.exports = (e) => {
  const body = e.requestInfo().body
  let data
  try { data = typeof body.profile === "string" ? JSON.parse(body.profile) : body.profile } catch { throw new BadRequestError("Invalid profile") }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new BadRequestError("Complete expert profile is required")
  const key = String(body.submission_key || "")
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(key)) throw new BadRequestError("Invalid submission key")
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")
  if (password.length < 8 || password !== body.passwordConfirm) throw new BadRequestError("Passwords must match and contain at least 8 characters")
  if (!String(data.public_name_en || "").trim() || !String(data.public_name_ar || "").trim()) throw new BadRequestError("Both expert names are required")
  const profileCollection = e.app.findCollectionByNameOrId("expert_profiles")
  if (!profileCollection.fields.getByName("submission_key")) throw new BadRequestError("Apply the expert submission migration first")
  const uploaded = key => {
    try { return e.findUploadedFiles(key) } catch (error) {
      if (String(error).includes("no such file")) return []
      throw error
    }
  }
  const photos = uploaded("profile_photo")
  const cvs = uploaded("cv")
  const fields = ["country_of_residence", "city", "whatsapp_country_code", "whatsapp_number", "highest_academic_degree", "degree_title", "field_of_study", "age_group", "specialization_type", "specialist_roles", "consultation_mode", "public_name_en", "public_name_ar", "public_qualification_en", "public_qualification_ar", "public_specialty_en", "public_specialty_ar", "short_bio_en", "short_bio_ar", "availability", "fee"]
  for (const field of fields) if (!profileCollection.fields.getByName(field)) throw new BadRequestError("Expert profile storage is not configured: " + field)
  for (const field of ["short_bio_en", "short_bio_ar"]) if (String(data[field] || "").length > 250) throw new BadRequestError("Biography must not exceed 250 characters")
  const iban = String(body.expert_iban || "").replace(/\s/g, "").toUpperCase()
  if (iban) {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) throw new BadRequestError("Invalid IBAN")
    let remainder = 0
    for (const char of iban.slice(4) + iban.slice(0,4)) {
      const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0)-55) : char
      for (const digit of digits) remainder=(remainder*10+Number(digit))%97
    }
    if (remainder !== 1) throw new BadRequestError("Invalid IBAN checksum")
  }
  let user
  e.app.runInTransaction(app => {
    // Check retry ownership inside the same transaction as the insert.
    const previous = app.findRecordsByFilter("expert_profiles", "submission_key = {:key}", "", 1, 0, {key})
    if (previous.length) {
      const owner = app.findRecordById("users", previous[0].getString("user"))
      if (owner.getString("role") !== "expert" || owner.getString("email").toLowerCase() !== email || !owner.validatePassword(password)) throw new BadRequestError("Invalid submission retry")
      user = owner
      return
    }
    user = new Record(app.findCollectionByNameOrId("users"))
    user.set("email", email)
    user.set("emailVisibility", true)
    user.set("name", String(data.public_name_ar || data.public_name_en).trim())
    user.set("password", password)
    user.set("role", "expert")
    user.set("is_active", false)
    app.save(user)
    const profile = new Record(app.findCollectionByNameOrId("expert_profiles"))
    for (const field of fields) if (data[field] !== undefined) profile.set(field, data[field])
    profile.set("user", user.id)
    profile.set("status", "submitted")
    profile.set("submission_key", key)
    profile.set("profile_photo", photos)
    profile.set("cv", cvs)
    app.save(profile)
    if (iban) {
      const bank = new Record(app.findCollectionByNameOrId("expert_bank_details"))
      bank.set("user", user.id)
      bank.set("iban", iban)
      app.save(bank)
    }
  })
  return e.json(200, {id:user.id, token:user.newAuthToken(), success:true})
}
