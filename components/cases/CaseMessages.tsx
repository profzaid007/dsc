"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import type { RecordModel } from "pocketbase"
import pb, { getErrorMessage } from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Contact = { id: string; name: string; role: string }
const accept =
  ".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.mp4"

export function MessageBody({ text }: { text: string }) {
  return (
    <p dir="auto" className="[overflow-wrap:anywhere] whitespace-pre-wrap">
      {text.split(/(https?:\/\/[^\s<>]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  )
}

export function MessageAttachments({
  message,
  allowSave = false,
}: {
  message: RecordModel
  allowSave?: boolean
}) {
  const { lang } = useLang(),
    ar = lang === "ar"
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false)
  const { currentUser } = useAuth()
  const [saved, setSaved] = useState<string[]>([])
  const canSave =
    allowSave &&
    currentUser?.role === "expert" &&
    message.recipient === currentUser.id &&
    Boolean(message.case)
  async function saveToDocuments(filename: string) {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await pb.send(
        `/api/dsc/cases/${encodeURIComponent(message.case)}/documents/from-message`,
        {
          method: "POST",
          body: { message_id: message.id, filename },
          requestKey: null,
        }
      )
      setSaved((items) => [...items, filename])
      window.dispatchEvent(new Event("case-documents-updated"))
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setBusy(false)
    }
  }
  async function download(filename: string) {
    setError("")
    setBusy(true)
    try {
      const token = await pb.files.getToken()
      const response = await fetch(
        pb.files.getURL(message, filename, { token, download: true })
      )
      if (!response.ok)
        throw new Error(
          ar
            ? "المرفق غير متاح لك حاليًا. تحقق من صلاحية الوصول إلى الحالة."
            : "This attachment is unavailable. Check your access to the case."
        )
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-1">
      {(message.attachments as string[] | undefined)?.map((file) => (
        <div key={file} className="flex flex-wrap items-center gap-2">
          <Button
            key={file}
            type="button"
            variant="link"
            disabled={busy}
            className="h-auto max-w-full px-0 break-all whitespace-normal"
            onClick={() => void download(file)}
          >
            {ar ? "تنزيل المرفق: " : "Download attachment: "}
            {file}
          </Button>
          {canSave && (
            <Button
              type="button"
              variant="outline"
              disabled={busy || saved.includes(file)}
              onClick={() => void saveToDocuments(file)}
            >
              {saved.includes(file)
                ? ar
                  ? "حُفظ في مستندات الحالة"
                  : "Saved to case documents"
                : ar
                  ? "حفظ في مستندات الحالة"
                  : "Save to case documents"}
            </Button>
          )}
        </div>
      ))}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function CaseMessages({ caseId }: { caseId: string }) {
  const { currentUser } = useAuth(),
    { lang } = useLang(),
    ar = lang === "ar"
  const access = usePermissions()
  const canSend = currentUser?.role !== "admin" || access.can("messages.create")
  const canMarkRead =
    currentUser?.role !== "admin" || access.can("messages.update")
  const [contacts, setContacts] = useState<Contact[]>([]),
    [messages, setMessages] = useState<RecordModel[]>([])
  const [recipient, setRecipient] = useState(""),
    [body, setBody] = useState(""),
    [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true),
    [sending, setSending] = useState(false)
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("")
  const attachmentInput = useRef<HTMLInputElement>(null),
    inFlight = useRef(false)
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      const [people, records] = await Promise.all([
        pb.send<Contact[]>("/api/dsc/message-contacts", {
          method: "GET",
          query: { case_id: caseId },
          requestKey: null,
          signal,
        }),
        pb.collection("internal_messages").getFullList({
          filter: pb.filter("case = {:caseId}", { caseId }),
          sort: "created",
          requestKey: null,
          signal,
        }),
      ])
      if (!signal?.aborted) {
        setContacts(people)
        setMessages(records)
        setRecipient((value) =>
          people.some((p) => p.id === value) ? value : ""
        )
      }
    },
    [caseId]
  )
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        await refresh(controller.signal)
        if (!controller.signal.aborted) setError("")
      } catch (e) {
        if (!controller.signal.aborted) setError(getErrorMessage(e, lang))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    const timer = setInterval(() => void load(), 15000)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [refresh, lang])
  useEffect(() => {
    if (!recipient || !currentUser || !canMarkRead) return
    const unread = messages.filter(
      (m) => m.sender === recipient && m.recipient === currentUser.id && !m.read
    )
    if (!unread.length) return
    let active = true
    Promise.all(
      unread.map((m) =>
        pb
          .collection("internal_messages")
          .update(m.id, { read: true }, { requestKey: null })
      )
    )
      .then(() => {
        if (active)
          setMessages((items) =>
            items.map((m) =>
              unread.some((u) => u.id === m.id) ? { ...m, read: true } : m
            )
          )
        window.dispatchEvent(new Event("messages-updated"))
      })
      .catch((e) => {
        if (active) setError(getErrorMessage(e, lang))
      })
    return () => {
      active = false
    }
  }, [recipient, currentUser, messages, canMarkRead, lang])
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (
      !currentUser ||
      !recipient ||
      !body.trim() ||
      inFlight.current ||
      !canSend
    )
      return
    if (files.length > 5 || files.some((f) => f.size > 10 * 1024 * 1024)) {
      setError(
        ar
          ? "أرفق حتى 5 ملفات، بحد أقصى 10 ميغابايت لكل ملف."
          : "Attach up to 5 files, at most 10 MB each."
      )
      return
    }
    inFlight.current = true
    setSending(true)
    setError("")
    setNotice("")
    try {
      const data = new FormData()
      data.set("sender", currentUser.id)
      data.set("recipient", recipient)
      data.set("case", caseId)
      data.set("body", body.trim())
      data.set("subject", ar ? "رسالة بشأن الحالة" : "Case message")
      data.set("read", "false")
      files.forEach((file) => data.append("attachments", file))
      const record = await pb
        .collection("internal_messages")
        .create(data, { requestKey: null })
      setMessages((items) => [
        ...items.filter((item) => item.id !== record.id),
        record,
      ])
      setBody("")
      setFiles([])
      if (attachmentInput.current) attachmentInput.current.value = ""
      setNotice(ar ? "تم إرسال الرسالة." : "Message sent.")
      window.dispatchEvent(new Event("messages-updated"))
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      inFlight.current = false
      setSending(false)
    }
  }
  const thread = recipient
    ? messages.filter(
        (m) =>
          (m.sender === currentUser?.id && m.recipient === recipient) ||
          (m.sender === recipient && m.recipient === currentUser?.id)
      )
    : []
  return (
    <section
      className="space-y-4 rounded-lg border bg-card p-4"
      dir={ar ? "rtl" : "ltr"}
    >
      <h3 className="text-lg font-semibold">
        {ar ? "رسائل الحالة" : "Case messages"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {ar
          ? "تبادل الرسائل والمرفقات مع صاحب الحالة والخبير المخصص لها أو الإدارة. كل محادثة خاصة بالمرسل والمستلم."
          : "Exchange messages and attachments with the case client, allocated expert, or an administrator. Each conversation is private to its sender and recipient."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">{ar ? "جارٍ تحميل الرسائل…" : "Loading messages…"}</p>
      ) : (
        <>
          <Label htmlFor={`recipient-${caseId}`}>
            {ar ? "المستلم" : "Recipient"}
          </Label>
          <select
            id={`recipient-${caseId}`}
            value={recipient}
            disabled={sending}
            onChange={(e) => {
              setRecipient(e.target.value)
              setNotice("")
            }}
            className="min-h-11 w-full rounded-md border bg-background px-3"
          >
            <option value="">
              {ar ? "اختر المستلم" : "Choose a recipient"}
            </option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} —{" "}
                {["admin", "super_admin"].includes(c.role)
                  ? ar
                    ? "الإدارة"
                    : "Admin"
                  : c.role === "expert"
                    ? ar
                      ? "الخبير"
                      : "Expert"
                    : ar
                      ? "صاحب الحالة"
                      : "Client"}
              </option>
            ))}
          </select>
          {!contacts.length && (
            <p>
              {ar
                ? "لا يوجد مستلمون متاحون لهذه الحالة."
                : "No recipients are available for this case."}
            </p>
          )}
          {recipient && (
            <>
              <div
                className="max-h-96 space-y-3 overflow-y-auto"
                aria-live="polite"
              >
                {!thread.length && (
                  <p className="text-sm text-muted-foreground">
                    {ar
                      ? "لا توجد رسائل في هذه المحادثة بعد."
                      : "No messages in this conversation yet."}
                  </p>
                )}
                {thread.map((m) => (
                  <article
                    key={m.id}
                    className={`rounded-lg border p-3 ${m.sender === currentUser?.id ? "bg-primary/5" : "bg-muted/40"}`}
                  >
                    <p className="text-sm font-semibold">
                      {m.sender === currentUser?.id
                        ? ar
                          ? "أنت"
                          : "You"
                        : contacts.find((c) => c.id === m.sender)?.name}
                    </p>
                    <MessageBody text={m.body} />
                    <MessageAttachments
                      message={m}
                      allowSave={[
                        "parent",
                        "individual",
                        "organization",
                        "care_foundation",
                      ].includes(
                        contacts.find((c) => c.id === m.sender)?.role || ""
                      )}
                    />
                    <time className="text-xs text-muted-foreground">
                      {new Date(m.created).toLocaleString(ar ? "ar" : "en")}
                    </time>
                  </article>
                ))}
              </div>
              <form onSubmit={send} className="space-y-3 border-t pt-4">
                <Label htmlFor={`body-${caseId}`}>
                  {ar ? "الرسالة" : "Message"}
                </Label>
                <Textarea
                  id={`body-${caseId}`}
                  dir="auto"
                  required
                  maxLength={4000}
                  rows={4}
                  disabled={sending}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <Label htmlFor={`files-${caseId}`}>
                  {ar ? "المرفقات (اختياري)" : "Attachments (optional)"}
                </Label>
                <Input
                  ref={attachmentInput}
                  id={`files-${caseId}`}
                  type="file"
                  multiple
                  accept={accept}
                  disabled={sending}
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                <p className="text-xs text-muted-foreground">
                  {ar
                    ? "حتى 5 ملفات، 10 ميغابايت لكل ملف. مستندات وصور وملفات MP3 وWAV وMP4."
                    : "Up to 5 files, 10 MB each. Documents, images, MP3, WAV and MP4."}
                </p>
                <Button
                  type="submit"
                  disabled={sending || !body.trim() || !canSend}
                >
                  {sending
                    ? ar
                      ? "جارٍ الإرسال…"
                      : "Sending…"
                    : ar
                      ? "إرسال الرسالة"
                      : "Send message"}
                </Button>
                {notice && (
                  <p role="status" className="text-sm text-green-700">
                    {notice}
                  </p>
                )}
              </form>
            </>
          )}
        </>
      )}
    </section>
  )
}
