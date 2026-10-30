module.exports = (e) => {
  const b = e.requestInfo().body
  const u = b.user || {},
    p = b.profile || {},
    cases = b.cases || []
  const roles = {
    individual: "individual_profiles",
    parent: "parent_profiles",
    organization: "organization_profiles",
    care_foundation: "organization_profiles",
  }
  const invalid = (field, code, message) => {
    throw new BadRequestError(message, { [field]: new ValidationError(code, message) })
  }
  if (!roles[u.role]) invalid("role", "registration_account_type", "Select a supported account type.")
  if (p.collection !== roles[u.role])
    throw new BadRequestError("The registration form selected the wrong profile type. Reload the form before trying again. No account was created.")
  if (!Array.isArray(cases) || cases.length > 30)
    invalid("children", "registration_children_limit", "You can register at most 30 children at a time.")
  const text = (value, required, max, field) => {
    if (value !== undefined && typeof value !== "string")
      invalid(field, "registration_text_type", "Enter text in this field.")
    const valueText = String(value || "").trim()
    if (required && !valueText) invalid(field, "validation_required", "This field is required.")
    if (valueText.length > max)
      invalid(field, "registration_max_length", "Use no more than " + max + " characters.")
    return valueText
  }
  const phone = (value, field) => {
    const valueText = text(value, true, 40, field).replace(/[\s()\-]/g, "")
    if (!/^\+[1-9]\d{6,14}$/.test(valueText))
      invalid(field, "registration_phone", "Enter a phone number with its country code, for example +966501234567.")
    return valueText
  }
  const email = text(u.email, true, 254, "email").toLowerCase(),
    name = text(u.name, true, 200, "name")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    invalid("email", "validation_email", "Enter a valid email address, for example name@example.com.")
  const password = u.password
  if (typeof password !== "string" || password.length < 8 || password.length > 128)
    throw new BadRequestError("Password must contain 8 to 128 characters.", {
      password: new ValidationError("validation_password_length", "Password must contain 8 to 128 characters.")
    })
  if (password !== u.passwordConfirm)
    throw new BadRequestError("Password confirmation does not match.", {
      passwordConfirm: new ValidationError("validation_password_mismatch", "Re-enter the same password in both fields.")
    })
  const contact = phone(u.contact_number, "contact_number"),
    key = text(b.submission_key, true, 64, "submission_key")
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(key))
    throw new BadRequestError("Your registration session is invalid. Reload the form and submit again. No account was created.")
  const fields = {
    individual_profiles: [
      "gender",
      "date_of_birth",
      "country_of_residence",
      "emergency_contact_name",
      "emergency_contact_phone",
      "notes",
    ],
    parent_profiles: ["country_of_residence", "city_of_residence", "notes"],
    organization_profiles: [
      "organization_name",
      "organization_type",
      "country",
      "city",
      "address",
      "website",
      "responsible_person_name",
      "responsible_person_title",
      "responsible_person_phone",
      "notes",
    ],
  }
  if (u.role === "individual" && !["male", "female"].includes(p.gender))
    invalid("gender", "registration_gender", "Select male or female.")
  if (p.collection === "organization_profiles")
    text(p.organization_name, true, 200, "organization_name")
  if (p.emergency_contact_phone)
    p.emergency_contact_phone = phone(p.emergency_contact_phone, "emergency_contact_phone")
  const date = (value, field) => {
    if (
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value ||
        Date.parse(value) > Date.now())
    )
      invalid(field, "registration_date", "Enter a valid date of birth that is not in the future.")
  }
  date(p.date_of_birth, "date_of_birth")
  for (const [index, c] of cases.entries()) {
    text(c.name, true, 200, `children.${index}.name`)
    text(c.portal_type, true, 200, `children.${index}.portal_type`)
    text(c.service_type, true, 200, `children.${index}.service_type`)
    date(c.date_of_birth, `children.${index}.date_of_birth`)
    if (u.role === "parent") {
      text(c.relationship, true, 100, `children.${index}.relationship`)
      if (!["male", "female"].includes(c.gender))
        invalid(`children.${index}.gender`, "registration_gender", "Select male or female.")
    }
  }
  const profileCollection = e.app.findCollectionByNameOrId(p.collection)
  if (!profileCollection.fields.getByName("submission_key"))
    throw new BadRequestError("Registration setup is incomplete: " + p.collection + ".submission_key is missing. Apply the account registration migration. No account was created.")
  const save = (app, record) => {
    try { app.save(record) }
    catch (error) {
      throw new BadRequestError("Please correct the registration fields.", error.value || error)
    }
  }
  let user
  e.app.runInTransaction((app) => {
    const prior = app.findRecordsByFilter(
      p.collection,
      "submission_key = {:key}",
      "",
      1,
      0,
      { key }
    )
    if (prior.length) {
      user = app.findRecordById("users", prior[0].getString("user"))
      if (
        user.getString("email").toLowerCase() !== email ||
        user.getString("role") !== u.role ||
        !user.validatePassword(password)
      )
        throw new BadRequestError("This registration session belongs to a different submission. Reload the form; if your account already exists, sign in instead.")
      return
    }
    user = new Record(app.findCollectionByNameOrId("users"))
    for (const [field, value] of Object.entries({
      email,
      name,
      password,
      contact_number: contact,
      role: u.role,
      is_active: true,
      emailVisibility: true,
    }))
      user.set(field, value)
    save(app, user)
    const profile = new Record(app.findCollectionByNameOrId(p.collection))
    for (const field of fields[p.collection])
      if (p[field] !== undefined)
        profile.set(
          field,
          text(p[field], false, field === "notes" ? 5000 : 300, field)
        )
    profile.set("user", user.id)
    profile.set("submission_key", key)
    save(app, profile)
    if (b.program_id) {
      const program = app.findRecordById(
        "programs",
        text(b.program_id, true, 30, "program_id")
      )
      const row = new Record(app.findCollectionByNameOrId("cases"))
      const title = program.get("name")
      row.set(
        "name",
        typeof title === "object" ? title.en || title.ar : String(title)
      )
      row.set("user", user.id)
      row.set("portal_type", "Attending Training")
      row.set("service_type", row.getString("name"))
      row.set("program_id", program.id)
      row.set("program_status", "enrolled")
      row.set("status", "pending")
      row.set("user_details", { name, email, contact })
      save(app, row)
    }
    for (const [index, c] of cases.entries()) {
      const row = new Record(app.findCollectionByNameOrId("cases"))
      for (const field of [
        "name",
        "date_of_birth",
        "gender",
        "grade",
        "relationship",
        "portal_type",
        "service_type",
        "notes",
      ])
        if (c[field] !== undefined)
          row.set(field, text(c[field], false, field === "notes" ? 5000 : 300, `children.${index}.${field}`))
      row.set("user", user.id)
      row.set("status", "pending")
      row.set("user_details", { name, email, contact })
      const details = c.case_details || {}
      row.set("case_details", {
        custom_category: text(details.custom_category, false, 200, `children.${index}.custom_category`),
        custom_sub_category: text(details.custom_sub_category, false, 200, `children.${index}.custom_sub_category`),
      })
      save(app, row)
    }
  })
  return e.json(200, { id: user.id, success: true })
}
