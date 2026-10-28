onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth())
    require(`${__hooks}/lib/case-documents.js`).create(e)
  return e.next()
}, "case_documents")
routerAdd(
  "POST",
  "/api/dsc/cases/{caseId}/documents/from-message",
  (e) => require(`${__hooks}/lib/case-documents.js`).saveAttachment(e),
  $apis.requireAuth("users")
)
