"use client"

import type { RecordModel } from "pocketbase"
import { Mail } from "lucide-react"
import { MessageAttachments, MessageBody } from "@/components/cases/CaseMessages"

type Props = {
  messages: RecordModel[]
  userId: string
  contacts: { id: string; name: string }[]
  lang: "ar" | "en"
  onRead: (id: string) => void
}

export function ReceivedMessages({ messages, userId, contacts, lang, onRead }: Props) {
  const ar = lang === "ar"
  const received = messages.filter(message => message.recipient === userId)
    .sort((a, b) => b.created.localeCompare(a.created) || b.id.localeCompare(a.id))
  const unread = received.filter(message => !message.read).length
  return (
    <section aria-labelledby="received-messages-title" className="min-w-0 overflow-hidden rounded-xl border bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-6">
        <h2 id="received-messages-title" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <Mail className="h-5 w-5" aria-hidden="true" />
          {ar ? "الرسائل الواردة" : "Received messages"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {ar ? `${received.length} رسالة، ${unread} غير مقروءة` : `${received.length} messages, ${unread} unread`}
        </span>
      </header>
      {!received.length ? (
        <p className="p-6 text-center text-muted-foreground">{ar ? "لا توجد رسائل واردة بعد." : "No received messages yet."}</p>
      ) : (
        <div className="max-h-[32rem] divide-y overflow-y-auto">
          {received.map(message => (
            <details key={message.id} className="group" onToggle={event => {
              if (event.currentTarget.open && !message.read) onRead(message.id)
            }}>
              <summary className={`cursor-pointer space-y-2 p-4 outline-offset-[-2px] sm:p-6 ${!message.read ? "bg-primary/5" : ""}`}>
                <span className="ms-2 inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 align-top">
                  <span className="font-semibold">{contacts.find(contact => contact.id === message.sender)?.name || (ar ? "مرسل غير متاح" : "Unavailable sender")}</span>
                  <span className="break-words">{message.subject || (ar ? "بدون عنوان" : "No subject")}</span>
                  <time dateTime={message.created} className="text-xs text-muted-foreground">{new Date(message.created).toLocaleString(ar ? "ar" : "en")}</time>
                  <span className={`rounded-full px-2 py-1 text-xs ${message.read ? "bg-slate-100 text-slate-600" : "bg-amber-100 font-semibold text-amber-900"}`}>
                    {message.read ? (ar ? "مقروءة" : "Read") : (ar ? "غير مقروءة" : "Unread")}
                  </span>
                </span>
              </summary>
              <div className="space-y-3 border-t px-4 py-5 sm:px-6">
                <MessageBody text={message.body} />
                <MessageAttachments message={message} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
