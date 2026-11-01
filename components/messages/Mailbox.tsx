"use client"

import { useEffect, useRef, useState } from "react"
import type { RecordModel } from "pocketbase"
import Link from "next/link"
import { ArrowLeft, Filter, List, Mail, PenLine, Reply, Search, Send, UserRound, X } from "lucide-react"
import { MessageAttachments, MessageBody } from "@/components/cases/CaseMessages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { canMessageContact, mailboxMessages, ownMessages, replySubject, type MailFolder, type MessageContact, type MessageDraft, type MessageSendResult } from "./mailbox-model"

type Draft = MessageDraft
type Props = {
  messages: RecordModel[]
  contacts: MessageContact[]
  userId: string
  lang: "en" | "ar"
  isAdmin: boolean
  canCreate: boolean
  caseRoute: string
  sending: boolean
  actionError: string
  notice: string
  onRead: (message: RecordModel) => void
  onSend: (draft: Draft) => Promise<MessageSendResult>
  onClearNotice: () => void
}

export function Mailbox({ messages, contacts, userId, lang, isAdmin, canCreate, caseRoute, sending, actionError, notice, onRead, onSend, onClearNotice }: Props) {
  const ar = lang === "ar"
  const [folder, setFolder] = useState<MailFolder>("received")
  const [query, setQuery] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selectedId, setSelectedId] = useState("")
  const [draft, setDraft] = useState<Draft | null>(null)
  const [recipientQuery, setRecipientQuery] = useState("")
  const mine = ownMessages(messages, userId)
  const visible = mailboxMessages(messages, userId, folder, query, unreadOnly, contacts, selectedId)
  const selected = mine.find(message => message.id === selectedId)
  const unread = mine.filter(message => message.recipient === userId && !message.read).length
  const person = (id: string) => contacts.find(contact => contact.id === id)
  const unknown = ar ? "مستخدم غير متاح" : "Unavailable user"
  const folders = [
    { key: "received" as const, name: ar ? "الرسائل الواردة" : "Received messages", icon: Mail, count: unread },
    { key: "sent" as const, name: ar ? "الرسائل المرسلة" : "Sent messages", icon: Send, count: 0 },
    { key: "all" as const, name: ar ? "كل الرسائل" : "All messages", icon: List, count: 0 },
  ]
  const folderName = folders.find(item => item.key === folder)!.name
  const received = selected?.recipient === userId
  const sender = selected?.sender === userId ? (ar ? "أنت" : "You") : person(selected?.sender)?.name || unknown
  const replyContact = person(selected?.sender)
  const canReply = received && canMessageContact(replyContact, isAdmin, canCreate, selected?.case)
  const recipients = contacts.filter(contact => canMessageContact(contact, isAdmin, canCreate, draft?.caseId) && (!draft?.caseId || draft.recipients.includes(contact.id)))
  const matchingRecipients = recipients.filter(contact => contact.name.toLocaleLowerCase().includes(recipientQuery.trim().toLocaleLowerCase()))
  const allSelected = recipients.length > 0 && recipients.every(contact => draft?.recipients.includes(contact.id))
  const validRecipients = Boolean(draft?.recipients.length) && draft!.recipients.every(id => recipients.some(contact => contact.id === id)) && (!draft?.caseId || draft.recipients.length === 1)
  const showReader = Boolean(selected || draft)
  const listRef = useRef<HTMLElement>(null)
  const readerRef = useRef<HTMLElement>(null)
  const previousReader = useRef(false)
  useEffect(() => {
    if (previousReader.current !== showReader && window.matchMedia("(max-width: 1279px)").matches) {
      ;(showReader ? readerRef.current : listRef.current)?.focus()
    }
    previousReader.current = showReader
  }, [showReader])
  const primaryButton = "h-12 rounded-xl bg-[#005cae] px-5 text-base font-semibold text-white shadow-sm hover:bg-[#004c92]"
  function changeFolder(next: MailFolder) {
    if (sending) return
    setFolder(next); setSelectedId(""); setDraft(null); setUnreadOnly(false); onClearNotice()
  }
  function openMessage(message: RecordModel) {
    if (sending) return
    setSelectedId(message.id); setDraft(null); onClearNotice(); if (message.recipient === userId && !message.read) onRead(message)
  }
  function compose() {
    setDraft({ recipients: [], subject: "", body: "", caseId: "" }); setRecipientQuery(""); onClearNotice()
  }
  function reply() {
    if (!selected || !canReply) return
    setDraft({ recipients: [selected.sender], subject: replySubject(selected.subject || ""), body: "", caseId: selected.case || "" }); setRecipientQuery(""); onClearNotice()
  }
  const back = () => { if (!sending) { setSelectedId(""); setDraft(null); onClearNotice() } }
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[190px_minmax(280px,340px)_minmax(0,1fr)] 2xl:grid-cols-[200px_minmax(300px,370px)_minmax(0,1fr)]">
      <nav aria-label={ar ? "مجلدات الرسائل" : "Message folders"} className="flex min-w-0 flex-wrap items-center gap-2 xl:block xl:space-y-2 xl:pt-2">
        <Button aria-label={ar ? "رسالة جديدة" : "New message"} onClick={compose} disabled={!canCreate || sending} className={`${primaryButton} mb-1 w-full gap-2 xl:mb-4`}><PenLine className="size-5" />{ar ? "رسالة جديدة" : "New message"}</Button>
        {folders.map(item => <button key={item.key} type="button" aria-pressed={folder === item.key && !draft} onClick={() => changeFolder(item.key)} disabled={sending} className={`flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005cae] xl:w-full ${item.key === "all" ? "xl:mt-5 xl:border-t xl:border-[#dfe8f2] xl:pt-5" : ""} ${folder === item.key && !draft ? "bg-[#dcecff] text-[#06385f]" : "text-[#163a60] hover:bg-[#edf5ff]"}`}><item.icon className="size-5 shrink-0" /><span>{item.name}</span>{item.count > 0 && <span className="ms-auto rounded-full bg-[#0064b9] px-1.5 py-0.5 text-xs text-white">{item.count}</span>}</button>)}
      </nav>

      <section ref={listRef} tabIndex={-1} aria-label={folderName} className={`${showReader ? "hidden xl:flex" : "flex"} min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dce6f2] bg-white shadow-[0_1px_2px_#102c5014] xl:min-h-[calc(100dvh-16rem)]`}>
        <header className="space-y-4 p-4 pb-3">
          <h2 className="flex items-start gap-2 text-lg font-bold tracking-tight text-[#08375e]"><Mail className="mt-0.5 size-5 shrink-0" /><span>{folderName} ({visible.length})</span></h2>
          <div className="flex min-w-0 gap-2"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute start-3 top-3.5 size-4 text-[#234766]" /><Input value={query} onChange={event => setQuery(event.target.value)} aria-label={ar ? "البحث في الرسائل" : "Search in messages"} placeholder={ar ? "ابحث في الرسائل…" : "Search in messages..."} className="h-11 rounded-xl border-[#dce6f2] ps-9 text-sm shadow-none" /></div><Button variant="outline" aria-label={ar ? "إظهار غير المقروءة فقط" : "Show unread only"} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(value => !value)} className={`size-11 shrink-0 rounded-xl border-[#dce6f2] ${unreadOnly ? "bg-[#dcecff] text-[#005cae]" : "bg-[#f7faff] text-[#183d63]"}`}><Filter className="size-5" /></Button></div>
        </header>
        <div className="flex-1 space-y-1 overflow-y-auto p-2 xl:max-h-[calc(100dvh-24rem)]">
          {!visible.length && <div role="status" className="px-5 py-12 text-center text-sm leading-6 text-slate-500"><Mail className="mx-auto mb-3 size-8 text-[#9ab3ce]" />{query || unreadOnly ? (ar ? "لا توجد رسائل مطابقة." : "No matching messages.") : folder === "sent" ? (ar ? "لم ترسل أي رسائل بعد." : "No sent messages yet.") : (ar ? "لا توجد رسائل هنا بعد." : "No messages here yet.")}</div>}
          {visible.map(message => {
            const incoming = message.recipient === userId
            const contact = person(incoming ? message.sender : message.recipient)
            const name = contact?.name || unknown
            const active = message.id === selectedId
            return <button key={message.id} type="button" aria-pressed={active} onClick={() => openMessage(message)} className={`relative flex w-full min-w-0 gap-3 overflow-hidden rounded-xl border px-3 py-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-[#005cae] ${active ? "border-[#cfe3fc] bg-[#deedff] before:absolute before:inset-y-0 before:start-0 before:w-1 before:bg-[#0069c8]" : "border-transparent hover:border-[#dce6f2] hover:bg-[#f4f8fd]"}`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e4effc] text-[#0072cd]"><UserRound className="size-5" /></span>
              <span className="min-w-0 flex-1"><span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-1"><span dir="auto" className="min-w-0 break-words text-sm font-bold text-[#11385f]">{name}</span><time dateTime={message.created} className="shrink-0 text-[11px] leading-5 text-[#41607d]">{new Date(message.created).toLocaleString(ar ? "ar" : "en", { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></span><span className="mt-1 flex items-center justify-between gap-2"><span dir="auto" className="truncate text-sm text-[#234664]">{message.subject || (ar ? "بدون عنوان" : "No subject")}</span>{incoming && !message.read && <span aria-label={ar ? "غير مقروءة" : "Unread"} className="size-2.5 shrink-0 rounded-full bg-[#0070c9]" />}</span></span>
            </button>
          })}
        </div>
      </section>

      <section ref={readerRef} tabIndex={-1} aria-label={draft ? (ar ? "كتابة رسالة" : "Message composer") : (ar ? "قراءة الرسالة" : "Message reader")} className={`${showReader ? "flex" : "hidden xl:flex"} min-h-[36rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dce6f2] bg-white shadow-[0_1px_2px_#102c5014] xl:min-h-[calc(100dvh-16rem)]`}>
        <div className="border-b border-[#e0e8f2] p-4 xl:hidden"><Button variant="ghost" onClick={back} disabled={sending} className="h-10 gap-2 text-[#16456e]"><ArrowLeft className="size-4 rtl:rotate-180" />{ar ? "العودة إلى الرسائل" : "Back to messages"}</Button></div>
        {draft ? <form className="flex flex-1 flex-col" onSubmit={async event => { event.preventDefault(); const result = await onSend(draft); if (result.sent > 0 && !result.failedRecipients.length) { setDraft(null); setSelectedId(""); setFolder("sent") } else if (result.failedRecipients.length) { setDraft({ ...draft, recipients: result.failedRecipients }) } }}>
          <header className="flex items-center justify-between gap-3 border-b border-[#e0e8f2] p-5 sm:p-6"><h2 className="text-xl font-bold text-[#09395f]">{draft.caseId ? (ar ? "الرد على رسالة الحالة" : "Reply to case message") : (ar ? "رسالة جديدة" : "New message")}</h2><Button type="button" variant="ghost" size="icon" aria-label={ar ? "إلغاء الرسالة" : "Cancel message"} disabled={sending} onClick={() => { setDraft(null); onClearNotice() }}><X /></Button></header>
          <div className="flex-1 space-y-5 p-5 sm:p-6"><fieldset className="min-w-0 space-y-3" disabled={sending}>
              <legend className="mb-2 text-sm font-medium">{ar ? "إلى" : "To"}</legend>
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-3.5 size-4 text-[#234766]" aria-hidden="true" />
                <Input id="message-contact" value={recipientQuery} onChange={event => setRecipientQuery(event.target.value)} aria-label={ar ? "البحث عن مستلمين" : "Search recipients"} placeholder={ar ? "ابحث باسم المستلم…" : "Search recipients by name..."} className="h-11 border-[#dce6f2] ps-9" />
              </div>
              {!draft.caseId && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f4f8fd] px-3 py-2">
                <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={allSelected} disabled={!recipients.length} onChange={event => setDraft({ ...draft, recipients: event.target.checked ? recipients.map(contact => contact.id) : [] })} className="size-4 accent-[#005cae]" />
                  {ar ? `الإرسال للجميع (${recipients.length})` : `Send to all (${recipients.length})`}
                </label>
                <span role="status" className="text-xs text-[#41607d]">{ar ? `تم اختيار ${draft.recipients.length} مستلم` : `${draft.recipients.length} recipients selected`}</span>
              </div>}
              {draft.recipients.length > 0 && <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto" aria-label={ar ? "المستلمون المحددون" : "Selected recipients"}>
                {draft.recipients.map(id => <span key={id} className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#e0edff] px-3 py-1 text-sm text-[#135389]">
                  <span className="min-w-0 truncate" dir="auto">{person(id)?.name || unknown}</span>
                  {!draft.caseId && <button type="button" aria-label={ar ? `إزالة ${person(id)?.name || unknown}` : `Remove ${person(id)?.name || unknown}`} onClick={() => setDraft({ ...draft, recipients: draft.recipients.filter(value => value !== id) })} className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-[#c8dfff]"><X className="size-3.5" /></button>}
                </span>)}
              </div>}
              <div className="max-h-44 overflow-y-auto rounded-lg border border-[#dce6f2]" aria-label={ar ? "قائمة المستلمين" : "Recipient list"}>
                {matchingRecipients.map(contact => <label key={contact.id} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-[#edf2f8] px-3 py-2 last:border-0 hover:bg-[#f4f8fd]">
                  <input type="checkbox" checked={draft.recipients.includes(contact.id)} disabled={Boolean(draft.caseId)} onChange={event => setDraft({ ...draft, recipients: event.target.checked ? [...draft.recipients, contact.id] : draft.recipients.filter(id => id !== contact.id) })} className="size-4 shrink-0 accent-[#005cae]" />
                  <span className="min-w-0 break-words text-sm" dir="auto">{contact.name}</span>
                </label>)}
                {!matchingRecipients.length && <p className="p-3 text-sm text-slate-500">{recipientQuery ? (ar ? "لا يوجد مستلمون مطابقون للبحث." : "No matching recipients.") : (ar ? "لا يوجد مستلمون متاحون حاليًا." : "No recipients are available yet.")}</p>}
              </div>
              <p className="text-xs leading-5 text-[#41607d]">{draft.caseId ? (ar ? "يرسل هذا الرد إلى مرسل رسالة الحالة فقط." : "This case reply is sent only to the original sender.") : (ar ? "يشمل خيار الجميع جميع المستلمين المتاحين حسب صلاحياتك، حتى إن لم يظهروا في نتائج البحث. تصل لكل مستلم رسالة منفصلة." : "All includes every available recipient, including those outside the search results. Each recipient receives a separate message.")}</p>
            </fieldset><div className="space-y-2"><Label htmlFor="message-subject">{ar ? "العنوان" : "Subject"}</Label><Input id="message-subject" dir="auto" value={draft.subject} maxLength={200} required disabled={sending} onChange={event => setDraft({ ...draft, subject: event.target.value })} className="h-11 border-[#dce6f2]" /></div><div className="space-y-2"><Label htmlFor="message-body">{ar ? "الرسالة" : "Message"}</Label><Textarea id="message-body" dir="auto" rows={10} value={draft.body} maxLength={4000} required disabled={sending} onChange={event => setDraft({ ...draft, body: event.target.value })} className="min-h-56 border-[#dce6f2]" /><p className="text-end text-xs text-slate-500">{draft.body.length}/4000</p></div>{actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}</div>
          <footer className="flex flex-wrap justify-end gap-3 border-t border-[#e0e8f2] p-5"><Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={sending} className="h-12 rounded-xl px-5">{ar ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={sending || !draft.body.trim() || !draft.subject.trim() || !validRecipients} className={`${primaryButton} gap-2`}><Send className="size-4" />{sending ? (ar ? "جارٍ الإرسال…" : "Sending...") : (ar ? `إرسال (${draft.recipients.length})` : `Send message (${draft.recipients.length})`)}</Button></footer>
        </form> : selected ? <>
          <header className="border-b border-[#e0e8f2] px-5 py-6 sm:px-6"><h2 dir="auto" className="break-words text-xl font-bold tracking-tight text-[#09395f]">{selected.subject || (ar ? "بدون عنوان" : "No subject")}</h2></header>
          <div className="mx-5 flex flex-wrap items-center gap-3 border-b border-[#e0e8f2] py-5 sm:mx-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e4effc] text-[#104d7b]"><UserRound className="size-6" /></span><div className="min-w-0 flex-1"><p dir="auto" className="break-words font-bold text-[#143c61]">{sender}</p><time dateTime={selected.created} className="mt-1 block text-sm text-[#41607d]">{new Date(selected.created).toLocaleString(ar ? "ar" : "en")}</time>{!received && <p className="mt-1 text-xs text-[#41607d]">{ar ? "إلى: " : "To: "}{person(selected.recipient)?.name || unknown}</p>}</div><span className="rounded-lg bg-[#e0edff] px-3 py-1 text-xs font-semibold text-[#135389]">{received ? (ar ? "واردة" : "Received") : (ar ? "مرسلة" : "Sent")}</span></div>
          <div className="flex-1 space-y-5 px-5 py-6 text-base leading-7 text-[#172b3d] sm:px-6"><MessageBody text={selected.body || ""} /><MessageAttachments message={selected} allowSave={received && Boolean(selected.case)} />{selected.case && <Link href={`/dashboard/${caseRoute}/${selected.case}`} className="block text-sm text-[#0061ab] underline">{ar ? "فتح محادثة الحالة والمرفقات" : "Open case conversation and attachments"}</Link>}{actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}</div>
          <footer className="mx-5 flex flex-wrap items-center justify-end gap-3 border-t border-[#e0e8f2] py-4 sm:mx-6">{received && !canReply && <p className="text-sm text-slate-500">{ar ? "الرد غير متاح لهذا المرسل." : "Reply is unavailable for this sender."}</p>}{received && <Button aria-label={ar ? "رد" : "Reply"} onClick={reply} disabled={!canReply} className={`${primaryButton} gap-2`}><Reply className="size-5 rtl:scale-x-[-1]" />{ar ? "رد" : "Reply"}</Button>}</footer>
        </> : <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"><Mail className="size-12 text-[#9bb7d3]" /><h2 className="text-xl font-semibold text-[#21496c]">{ar ? "اختر رسالة لقراءتها" : "Select a message to read"}</h2><p className="max-w-xs text-sm leading-6 text-slate-500">{ar ? "اختر رسالة من القائمة أو اكتب رسالة جديدة." : "Choose a message from the list or start a new message."}</p>{notice && <p role="status" className="text-sm text-green-700">{notice}</p>}</div>}
      </section>
    </div>
  )
}
