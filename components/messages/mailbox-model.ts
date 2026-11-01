import type { RecordModel } from "pocketbase"

export type MailFolder = "received" | "sent" | "all"
export type MessageContact = { id: string; name: string; role: string }

export function ownMessages(messages: RecordModel[], userId: string) {
  return messages.filter(message => message.sender === userId || message.recipient === userId)
}

export function mailboxMessages(messages: RecordModel[], userId: string, folder: MailFolder, query: string, unreadOnly: boolean, contacts: MessageContact[], selectedId = "") {
  const search = query.trim().toLocaleLowerCase()
  return ownMessages(messages, userId).filter(message => {
    if (folder === "received" && message.recipient !== userId) return false
    if (folder === "sent" && message.sender !== userId) return false
    if (unreadOnly && (message.recipient !== userId || message.read) && message.id !== selectedId) return false
    const person = contacts.find(contact => contact.id === (message.sender === userId ? message.recipient : message.sender))
    return !search || [person?.name, message.subject, message.body].some(value => String(value || "").toLocaleLowerCase().includes(search))
  }).sort((a, b) => b.created.localeCompare(a.created) || b.id.localeCompare(a.id))
}

export function canMessageContact(contact: MessageContact | undefined, isAdmin: boolean, canCreate: boolean, caseId = "") {
  return Boolean(contact && canCreate && (isAdmin || caseId || ["admin", "super_admin"].includes(contact.role)))
}

export function replySubject(subject: string) {
  return (/^re\s*:/i.test(subject) ? subject : `Re: ${subject}`).slice(0, 200)
}
