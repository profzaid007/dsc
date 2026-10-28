onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth())
    require(`${__hooks}/lib/case-messaging.js`).create(e)
  return e.next()
}, "internal_messages")
onRecordUpdateRequest((e) => {
  if (!e.hasSuperuserAuth())
    require(`${__hooks}/lib/case-messaging.js`).update(e)
  return e.next()
}, "internal_messages")
