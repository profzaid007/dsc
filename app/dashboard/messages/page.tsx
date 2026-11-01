"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { RecordModel } from "pocketbase"
import { Mailbox } from "@/components/messages/Mailbox"
import { canMessageContact, deliverMessages, messageAttachmentError, messageFormData, type MessageContact, type MessageDraft } from "@/components/messages/mailbox-model"
import pb, { getErrorMessage } from "@/lib/pb"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"

export default function MessagesPage() {
  return <Suspense fallback={<PageLoader />}><MessagesInbox /></Suspense>
}

function MessagesInbox() {
  const caseId = useSearchParams().get("case") || ""
  const scope = useRef("")
  const [loadedScope, setLoadedScope] = useState<string | null>(null)
  const [caseContext, setCaseContext] = useState<{ id: string; name: string }>()
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
    const requestScope = currentUser.id + ":" + caseId
    scope.current = requestScope
    try {
      const [contactData, records, caseRecord] = await Promise.all([
        pb.send<{ contacts: MessageContact[] } | MessageContact[]>("/api/dsc/message-contacts", { method: "GET", query: caseId ? { case_id: caseId } : {}, requestKey: null }),
        pb.collection("internal_messages").getFullList({ sort: "-created", expand: "case", filter: caseId ? pb.filter("case = {:id}", { id: caseId }) : "", requestKey: null }),
        caseId ? pb.collection("cases").getOne(caseId, { fields: "id,name", requestKey: null }) : Promise.resolve(undefined),
      ])
      if (scope.current !== requestScope) return
      setCaseContext(caseRecord ? { id: caseRecord.id, name: caseRecord.name } : undefined)
      setContacts(Array.isArray(contactData) ? contactData : contactData.contacts)
      setMessages(records)
    } catch (e) { if (scope.current === requestScope) { setError(getErrorMessage(e, lang)); setMessages([]); setContacts([]); setCaseContext(undefined) } }
    finally { if (scope.current === requestScope) { setLoading(false); setLoadedScope(requestScope) } }
  }, [currentUser, allowed, lang, caseId])
  useEffect(() => {
    if (authLoading || !allowed) return
    const initial = setTimeout(() => void refresh(), 0)
    const interval = setInterval(() => void refresh(true), 15000)
    return () => { scope.current = ""; clearTimeout(initial); clearInterval(interval) }
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
    if (!currentUser || sending || !ids.length || !draft.body.trim() || !draft.subject.trim() || (draft.replyTo && (ids.length !== 1 || ids[0] !== draft.replyTo)) || (caseId && draft.caseId !== caseId) || ids.some(id => !canMessageContact(contacts.find(contact => contact.id === id), isAdmin, canCreate, draft.caseId))) {
      return { sent: 0, failedRecipients: ids }
    }
    const fileError = messageAttachmentError(draft.attachments || [], lang)
    if (fileError) { setActionError(fileError); return { sent: 0, failedRecipients: ids } }
    setSending(true); setActionError(""); setNotice("")
    try {
      const result = await deliverMessages(ids, recipient => pb.collection("internal_messages").create(messageFormData(currentUser.id, recipient, draft), { requestKey: null }))
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
    {caseContext?.id === caseId && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"><Link href={`/dashboard/${caseRoute}/${caseContext.id}`} className="font-semibold text-[#073b62]">{ar ? "رسائل الحالة: " : "Case messages: "}{caseContext.name}</Link><Link href="/dashboard/messages" className="text-[#0061ab] underline">{ar ? "عرض جميع الرسائل" : "Show all messages"}</Link></div>}
    {error && <DataError message={error} onRetry={() => refresh()} />}
    {loading || loadedScope !== currentUser.id + ":" + caseId ? <PageLoader /> : !error && <Mailbox key={currentUser.id + ":" + caseId} caseContext={caseContext} messages={messages} contacts={contacts} userId={currentUser.id} lang={lang} isAdmin={isAdmin} canCreate={canCreate} caseRoute={caseRoute} sending={sending} actionError={actionError} notice={notice} onRead={readMessage} onSend={send} onClearNotice={() => { setNotice(""); setActionError("") }} />}
  </div>
}
