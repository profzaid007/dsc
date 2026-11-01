"use client"

import { useCallback, useEffect, useState } from "react"
import type { RecordModel } from "pocketbase"
import { Mailbox } from "@/components/messages/Mailbox"
import { canMessageContact, deliverMessages, type MessageContact, type MessageDraft } from "@/components/messages/mailbox-model"
import pb, { getErrorMessage } from "@/lib/pb"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"

export default function MessagesPage() {
  const { currentUser, isAdmin, isLoading: authLoading } = useAuth()
  const { lang } = useLang()
  const ar = lang === "ar"
  const access = usePermissions()
  const isParticipant = ["expert", "parent", "individual", "organization", "care_foundation"].includes(currentUser?.role || "")
  const allowed = isParticipant || isAdmin && access.can("messages.read")
  const canMarkRead = isParticipant || access.can("messages.update")
  const canCreate = isParticipant || access.can("messages.create")
  const [contacts, setContacts] = useState<MessageContact[]>([])
  const [messages, setMessages] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const refresh = useCallback(async (quiet = false) => {
    if (!currentUser || !allowed) return
    if (!quiet) setLoading(true)
    setError("")
    try {
      const [contactData, records] = await Promise.all([
        pb.send<{ contacts: MessageContact[] } | MessageContact[]>("/api/dsc/message-contacts", { method: "GET", requestKey: null }),
        pb.collection("internal_messages").getFullList({ sort: "-created", requestKey: null }),
      ])
      setContacts(Array.isArray(contactData) ? contactData : contactData.contacts)
      setMessages(records)
    } catch (e) { setError(getErrorMessage(e, lang)) }
    finally { setLoading(false) }
  }, [currentUser, allowed, lang])
  useEffect(() => {
    if (authLoading || !allowed) return
    const initial = setTimeout(() => void refresh(), 0)
    const interval = setInterval(() => void refresh(true), 15000)
    return () => { clearTimeout(initial); clearInterval(interval) }
  }, [refresh, authLoading, allowed])

  async function readMessage(message: RecordModel) {
    if (!currentUser || !canMarkRead || message.recipient !== currentUser.id || message.read) return
    try {
      await pb.collection("internal_messages").update(message.id, { read: true }, { requestKey: null })
      setMessages(items => items.map(item => item.id === message.id ? { ...item, read: true } : item))
      window.dispatchEvent(new Event("messages-updated"))
    } catch (e) { setActionError(getErrorMessage(e, lang)) }
  }

  async function send(draft: MessageDraft) {
    const ids = [...new Set(draft.recipients)]
    if (!currentUser || sending || !ids.length || !draft.body.trim() || !draft.subject.trim() || (draft.caseId && ids.length !== 1) || ids.some(id => !canMessageContact(contacts.find(contact => contact.id === id), isAdmin, canCreate, draft.caseId))) {
      return { sent: 0, failedRecipients: ids }
    }
    setSending(true); setActionError(""); setNotice("")
    try {
      const result = await deliverMessages(ids, recipient => pb.collection("internal_messages").create({ sender: currentUser.id, recipient, body: draft.body.trim(), subject: draft.subject.trim(), read: false, ...(draft.caseId ? { case: draft.caseId } : {}) }, { requestKey: null }))
      if (result.records.length) {
        setMessages(items => [...items.filter(item => !result.records.some(record => record.id === item.id)), ...result.records])
        window.dispatchEvent(new Event("messages-updated"))
      }
      if (result.failedRecipients.length) {
        setActionError(ar ? `تم الإرسال إلى ${result.records.length} مستلم، وتعذر الإرسال إلى ${result.failedRecipients.length}. بقي المستلمون الذين تعذر الإرسال إليهم محددين لإعادة المحاولة فقط.` : `Sent to ${result.records.length} recipients; delivery failed for ${result.failedRecipients.length}. Only failed recipients remain selected for retry.`)
      } else {
        setNotice(ar ? `تم إرسال الرسالة إلى ${result.records.length} مستلم.` : `Message sent to ${result.records.length} recipients.`)
      }
      return { sent: result.records.length, failedRecipients: result.failedRecipients }
    } finally { setSending(false) }
  }

  if (authLoading || isAdmin && access.isLoading) return <PageLoader />
  if (!allowed || !currentUser) return <p role="alert">{ar ? "لا يملك حسابك صلاحية الوصول إلى الرسائل." : "Your account does not have access to messages."}</p>
  const caseRoute = isAdmin ? "admin/cases" : currentUser.role === "expert" ? "expert/cases" : currentUser.role === "parent" ? "parent/cases" : currentUser.role === "individual" ? "individual/cases" : currentUser.role === "organization" ? "institution/projects" : "cases"
  return <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5" dir={ar ? "rtl" : "ltr"}>
    <header className="border-b border-[#dce6f2] pb-5">
      <p className="mb-1 text-sm font-bold text-[#e75b00]">DSC</p>
      <h1 className="text-3xl font-bold tracking-tight text-[#073b62]">{ar ? "الرسائل الداخلية" : "Internal messages"}</h1>
      <p className="mt-1 text-sm leading-6 text-[#335674] sm:text-base">{ar ? "اقرأ محادثاتك وتواصل مع فريق الإدارة." : "Read your conversations and contact the administration team."}</p>
    </header>
    {error && <DataError message={error} onRetry={() => refresh()} />}
    {loading ? <PageLoader /> : <Mailbox key={currentUser.id} messages={messages} contacts={contacts} userId={currentUser.id} lang={lang} isAdmin={isAdmin} canCreate={canCreate} caseRoute={caseRoute} sending={sending} actionError={actionError} notice={notice} onRead={readMessage} onSend={send} onClearNotice={() => { setNotice(""); setActionError("") }} />}
  </div>
}
