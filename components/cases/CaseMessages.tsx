"use client"

import { useState } from "react"
import type { RecordModel } from "pocketbase"
import pb, { getErrorMessage } from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { Button } from "@/components/ui/button"

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
  const { lang } = useLang()
  const ar = lang === "ar"
  return <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
    <div><h3 className="font-semibold">{ar ? "الرسائل" : "Messages"}</h3><p className="mt-1 text-sm text-muted-foreground">{ar ? "اقرأ وأرسل الرسائل المرتبطة بهذه الحالة من صندوق الرسائل الموحّد." : "Read and send messages about this case in your shared inbox."}</p></div>
    <Button asChild><Link href={`/dashboard/messages?case=${encodeURIComponent(caseId)}`}>{ar ? "فتح رسائل الحالة" : "Open case messages"}</Link></Button>
  </section>
}
