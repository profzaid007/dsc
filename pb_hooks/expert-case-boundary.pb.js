// Experts work on allocated cases; creating/managing case allocations is administrative.
const rejectExpertCaseMutation = e => {
  if (!e.hasSuperuserAuth() && e.auth) {
    const user = require(`${__hooks}/lib/security-policy.js`).freshUser(e.app, e.auth)
    if (user.getString("role") === "expert")
      throw new ForbiddenError("Experts cannot create or manage cases or allocate experts. / إنشاء الحالات وتخصيص الخبراء من صلاحيات الإدارة أو المفوضين بها.")
  }
  return e.next()
}
onRecordCreateRequest(rejectExpertCaseMutation, "cases", "case_experts")
onRecordUpdateRequest(rejectExpertCaseMutation, "cases", "case_experts")
onRecordDeleteRequest(rejectExpertCaseMutation, "cases", "case_experts")
