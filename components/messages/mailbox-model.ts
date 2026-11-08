import type { RecordModel } from "pocketbase"

export type MailFolder = "received" | "sent" | "all" | "between-users"
export type MessageContact = { id: string; name: string; role: string; name_ar?: string; name_en?: string }

export function ownMessages(messages: RecordModel[], userId: string) {
  return messages.filter(message => message.sender === userId || message.recipient === userId)
}

export function mailboxMessages(messages: RecordModel[], userId: string, folder: MailFolder, query: string, unreadOnly: boolean, contacts: MessageContact[], selectedId = "") {
  const search = query.trim().toLocaleLowerCase()
  const betweenUsers = folder === "between-users"
  const contactsById = new Map(contacts.map(contact => [contact.id, contact]))
  const scoped = betweenUsers
    ? messages.filter(message => message.sender !== userId && message.recipient !== userId)
    : ownMessages(messages, userId)
  return scoped.filter(message => {
    if (folder === "received" && message.recipient !== userId) return false
    if (folder === "sent" && message.sender !== userId) return false
    if (unreadOnly && (message.recipient !== userId || message.read) && message.id !== selectedId) return false
    if (!search) return true
    const ids = betweenUsers
      ? [message.sender, message.recipient]
      : [message.sender === userId ? message.recipient : message.sender]
    const names = ids.flatMap(id => {
      const person = contactsById.get(id)
      return [person?.name, person?.name_ar, person?.name_en]
    })
    return [...names, message.subject, message.body, message.expand?.case?.name].some(value => String(value || "").toLocaleLowerCase().includes(search))
  }).sort((a, b) => b.created.localeCompare(a.created) || b.id.localeCompare(a.id))
}

export function canMessageContact(contact: MessageContact | undefined, isAdmin: boolean, canCreate: boolean, caseId = "") {
  return Boolean(contact && canCreate && (isAdmin || caseId || ["admin", "super_admin"].includes(contact.role)))
}

export function replySubject(subject: string) {
  return (/^re\s*:/i.test(subject) ? subject : `Re: ${subject}`).slice(0, 200)
}


export type MessageDraft = { recipients: string[]; subject: string; body: string; caseId: string; replyTo?: string; attachments?: File[] }
export type MessageSendResult = { sent: number; failedRecipients: string[] }

// A separate message per recipient keeps addresses and read status private.
export async function deliverMessages(
  recipientIds: string[],
  deliver: (recipient: string) => Promise<RecordModel>,
) {
  const records: RecordModel[] = []
  const failedRecipients: string[] = []
  for (const recipient of [...new Set(recipientIds)]) {
    try { records.push(await deliver(recipient)) }
    catch { failedRecipients.push(recipient) }
  }
  return { records, failedRecipients }
}


export const messageAttachmentAccept = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.mp4"
export function messageAttachmentError(files: Pick<File, "name" | "size">[], lang: "ar" | "en") {
  const ar = lang === "ar"
  if (files.length > 5 || files.some(file => file.size > 10 * 1024 * 1024))
    return ar ? "لم تتم إضافة الملفات. الحد الأقصى 5 ملفات، بحجم 10 ميغابايت لكل ملف." : "Files were not added. Attach up to 5 files, at most 10 MB each."
  const extensions = messageAttachmentAccept.split(",")
  if (files.some(file => !extensions.some(extension => file.name.toLowerCase().endsWith(extension))))
    return ar ? "لم تتم إضافة الملفات. نوع الملف غير مدعوم؛ اختر مستندًا أو صورة أو ملف صوت أو فيديو مدعومًا." : "Files were not added. Unsupported file type; choose a supported document, image, audio or video file."
  return ""
}

export function messageFormData(sender: string, recipient: string, draft: MessageDraft) {
  const data = new FormData()
  data.set("sender", sender)
  data.set("recipient", recipient)
  data.set("subject", draft.subject.trim())
  data.set("body", draft.body.trim())
  data.set("read", "false")
  if (draft.caseId) data.set("case", draft.caseId)
  for (const file of draft.attachments || []) data.append("attachments", file)
  return data
}
