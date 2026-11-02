"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import type { RecordModel } from "pocketbase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import pb, { getErrorMessage } from "@/lib/pb"
import { useAuth } from "@/hooks/useAuth"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CaseDocuments({ caseId, mode = "all", documentId, basePath }: { caseId: string; mode?: "all" | "list" | "detail" | "create"; documentId?: string; basePath?: string }) {
  const router = useRouter()
  const { currentUser } = useAuth(),
    { lang } = useLang(),
    ar = lang === "ar",
    permissions = usePermissions()
  const canUpload =
    currentUser?.role === "expert" ||
    currentUser?.role === "super_admin" ||
    (currentUser?.role === "admin" && permissions.can("cases.create"))
  const [documents, setDocuments] = useState<RecordModel[]>([]),
    [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null),
    submitting = useRef(false)
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      try {
        if (mode === "create") { if (!signal?.aborted) setLoading(false); return }
        if (mode === "detail") {
          const record = await pb.collection("case_documents").getOne(documentId || "", { signal, requestKey: null })
          if (record.case !== caseId) throw new Error(ar ? "المستند لا ينتمي إلى هذه الحالة." : "This file does not belong to this case.")
          if (!signal?.aborted) { setDocuments([record]); setError("") }
          return
        }
        const records = await pb
          .collection("case_documents")
          .getFullList({
            filter: pb.filter("case = {:caseId}", { caseId }),
            sort: "-created",
            requestKey: null,
            signal,
          })
        if (!signal?.aborted) {
          setDocuments(records)
          setError("")
        }
      } catch (e) {
        if (!signal?.aborted) setError(getErrorMessage(e, lang))
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [caseId, lang, ar, mode, documentId]
  )
  useEffect(() => {
    const controller = new AbortController()
    const update = () => void refresh(controller.signal)
    update()
    window.addEventListener("case-documents-updated", update)
    return () => {
      controller.abort()
      window.removeEventListener("case-documents-updated", update)
    }
  }, [refresh])
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (
      !file ||
      !title.trim() ||
      !currentUser ||
      submitting.current ||
      !canUpload
    )
      return
    if (file.size > 10485760) {
      setError(
        ar
          ? "الحد الأقصى لحجم الملف 10 ميغابايت."
          : "The file must be at most 10 MB."
      )
      return
    }
    submitting.current = true
    setBusy(true)
    setError("")
    setNotice("")
    try {
      const data = new FormData()
      data.set("case", caseId)
      data.set("uploaded_by", currentUser.id)
      data.set("title", title.trim())
      data.set("description", description.trim())
      data.set("file", file)
      const saved = await pb.collection("case_documents").create(data, { requestKey: null })
      if (mode === "create" && basePath) { router.push(`${basePath}/${encodeURIComponent(saved.id)}`); return }
      setFile(null)
      setTitle("")
      setDescription("")
      if (input.current) input.current.value = ""
      setNotice(
        ar ? "تمت إضافة المستند إلى الحالة." : "Document added to this case."
      )
      await refresh()
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }
  async function download(doc: RecordModel) {
    setBusy(true)
    setError("")
    try {
      const token = await pb.files.getToken(),
        response = await fetch(
          pb.files.getURL(doc, doc.file, { token, download: true })
        )
      if (!response.ok)
        throw new Error(
          ar
            ? "المستند غير متاح لك حاليًا."
            : "This document is unavailable to you."
        )
      const url = URL.createObjectURL(await response.blob()),
        link = document.createElement("a")
      link.href = url
      link.download = doc.file
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      setError(getErrorMessage(e, lang))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      id="case-documents"
      className="space-y-4 rounded-lg border bg-card p-4"
      dir={ar ? "rtl" : "ltr"}
    >
      <h2 className="text-xl font-semibold">
        {mode === "create" ? (ar ? "ملف جديد" : "New file") : mode === "detail" ? (ar ? "تفاصيل الملف" : "File details") : (ar ? "ملفات الحالة" : "Case files")}
      </h2>
      {basePath && <div className="flex flex-wrap gap-3">{mode === "list" && <Button asChild variant="outline"><Link href={basePath.replace(/\/files$/, "")}>{ar ? "العودة إلى التكليفات" : "Back to assignments"}</Link></Button>}{mode !== "list" && <Button asChild variant="outline"><Link href={basePath}>{ar ? "العودة إلى ملفات الحالة" : "Back to case files"}</Link></Button>}{mode === "list" && canUpload && <Button asChild><Link href={`${basePath}/new`}>{ar ? "ملف جديد" : "New file"}</Link></Button>}</div>}
      <p className="text-sm text-muted-foreground">
        {ar
          ? "ملفات الحالة المحفوظة، بما فيها المرفقات التي أضافها الخبير من رسائل صاحب الحالة."
          : "Files saved for this case, including client message attachments saved by the expert."}
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {mode !== "create" && (loading ? (
        <p role="status">
          {ar ? "جارٍ تحميل المستندات…" : "Loading documents…"}
        </p>
      ) : documents.length ? (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li key={doc.id} className="rounded-md border p-3">
              <p dir="auto" className="font-medium [overflow-wrap:anywhere]">
                {basePath && mode === "list" ? <Link className="text-primary underline underline-offset-4" href={`${basePath}/${encodeURIComponent(doc.id)}`}>{doc.title || doc.file}</Link> : (doc.title || doc.file)}
              </p>
              {mode !== "list" && doc.description && (
                <p dir="auto" className="mt-1 whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">
                  {doc.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(doc.created).toLocaleString(ar ? "ar" : "en")} ·{" "}
                {doc.source_message
                  ? ar
                    ? "من مرفق رسالة"
                    : "Saved from a message"
                  : ar
                    ? "ملف مرفوع"
                    : "Uploaded file"}
              </p>
              {mode !== "list" && <p dir="auto" className="mt-2 text-sm [overflow-wrap:anywhere]">{ar ? "اسم الملف: " : "Filename: "}{doc.file}</p>}
              {mode !== "list" && <Button
                type="button"
                variant="link"
                disabled={busy}
                onClick={() => void download(doc)}
              >
                {ar ? "تنزيل المستند" : "Download document"}
              </Button>}
            </li>
          ))}
        </ul>
      ) : !error ? (
        <p>
          {ar
            ? "لا توجد مستندات لهذه الحالة بعد."
            : "No documents have been added to this case yet."}
        </p>
      ) : null)}
      {mode === "create" && !canUpload && <p role="alert">{ar ? "ليست لديك صلاحية إضافة ملفات لهذه الحالة." : "You do not have permission to add files to this case."}</p>}
      {canUpload && (mode === "all" || mode === "create") && (
        <form onSubmit={upload} className="space-y-3 border-t pt-4">
          <Label htmlFor={`document-title-${caseId}`}>
            {ar ? "اسم المستند" : "Document title"}
          </Label>
          <Input
            id={`document-title-${caseId}`}
            dir="auto"
            required
            maxLength={250}
            value={title}
            disabled={busy}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Label htmlFor={`document-description-${caseId}`}>
            {ar ? "وصف المستند (اختياري)" : "Document description (optional)"}
          </Label>
          <Textarea
            id={`document-description-${caseId}`}
            dir="auto"
            maxLength={2000}
            value={description}
            disabled={busy}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Label htmlFor={`document-file-${caseId}`}>
            {ar ? "الملف (حتى 10 ميغابايت)" : "File (up to 10 MB)"}
          </Label>
          <Input
            ref={input}
            id={`document-file-${caseId}`}
            type="file"
            required
            disabled={busy}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.mp4"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null
              setFile(selected)
              if (!title && selected) setTitle(selected.name.slice(0, 250))
            }}
          />
          <Button type="submit" disabled={busy || !file || !title.trim()}>
            {busy
              ? ar
                ? "جارٍ الحفظ…"
                : "Saving…"
              : ar
                ? "إضافة المستند"
                : "Add document"}
          </Button>
          {notice && (
            <p role="status" className="text-green-700">
              {notice}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
