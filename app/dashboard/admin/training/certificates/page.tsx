"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLang } from "@/lib/lang-context"
import { useTraining } from "@/hooks/useTraining"
import type { CreateCertificateInput, UpdateCertificateInput } from "@/types/training"

const emptyForm: CreateCertificateInput = {
  userId: "",
  userName: "",
  programName: { en: "", ar: "" },
  issueDate: new Date().toISOString().split("T")[0],
  certificateNumber: "",
  notes: "",
}

export default function CertificatesPage() {
  const { lang } = useLang()
  const {
    certificates,
    programs,
    sessions,
    isLoading,
    addCertificate,
    updateCertificate,
    deleteCertificate,
  } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCertificateInput>(emptyForm)
  const [file, setFile] = useState<File | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredCertificates = certificates.filter((c) =>
    c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (cert: (typeof certificates)[number]) => {
    setEditingId(cert.id)
    setFormData({
      userId: cert.userId,
      userName: cert.userName,
      programId: cert.programId,
      awarenessId: cert.awarenessId,
      programName: cert.programName,
      issueDate: cert.issueDate,
      certificateNumber: cert.certificateNumber,
      notes: cert.notes,
    })
    setFile(undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateCertificate(editingId, formData as UpdateCertificateInput, file)
      } else {
        await addCertificate(formData, file)
      }
      setFormData(emptyForm)
      setEditingId(null)
      setFile(undefined)
      if (fileRef.current) fileRef.current.value = ""
    } catch (err) {
      console.error("Failed to save certificate", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setFile(undefined)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(lang === "en" ? "Delete this certificate?" : "حذف هذه الشهادة؟")) {
      await deleteCertificate(id)
    }
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {lang === "en" ? "Certificates" : "الشهادات"}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "en" ? "Issued Certificates" : "الشهادات المصدرة"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={lang === "en" ? "Search certificates..." : "ابحث عن الشهادات..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            {filteredCertificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "No certificates found" : "لم يتم العثور على شهادات"}
              </p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{lang === "en" ? "Student" : "الطالب"}</TableHead>
                      <TableHead>{lang === "en" ? "Program" : "البرنامج"}</TableHead>
                      <TableHead>{lang === "en" ? "Number" : "الرقم"}</TableHead>
                      <TableHead>{lang === "en" ? "Actions" : "الإجراءات"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.userName}</TableCell>
                        <TableCell>{cert.programName[lang]}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{cert.certificateNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                              {lang === "en" ? "Edit" : "تعديل"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cert.id)}>
                              {lang === "en" ? "Delete" : "حذف"}
                            </Button>
                            {cert.file && (
                              <a href={cert.file} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                  {lang === "en" ? "View" : "عرض"}
                                </Button>
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingId
                ? lang === "en"
                  ? "Edit Certificate"
                  : "تعديل الشهادة"
                : lang === "en"
                  ? "Add Certificate"
                  : "إضافة شهادة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>{lang === "en" ? "Student Name *" : "اسم الطالب *"}</Label>
                <Input
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "en" ? "Program (EN) *" : "البرنامج (إنجليزي) *"}</Label>
                  <Input
                    value={formData.programName.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programName: { ...formData.programName, en: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "en" ? "Program (AR) *" : "البرنامج (عربي) *"}</Label>
                  <Input
                    value={formData.programName.ar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        programName: { ...formData.programName, ar: e.target.value },
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{lang === "en" ? "Issue Date" : "تاريخ الإصدار"}</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{lang === "en" ? "Certificate Number *" : "رقم الشهادة *"}</Label>
                  <Input
                    value={formData.certificateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, certificateNumber: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{lang === "en" ? "Link to Program (optional)" : "ربط ببرنامج (اختياري)"}</Label>
                <Select
                  value={formData.programId || ""}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      programId: v || undefined,
                      awarenessId: undefined,
                      programName: v
                        ? programs.find((p) => p.id === v)?.title || formData.programName
                        : formData.programName,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lang === "en" ? "Select program..." : "اختر برنامج..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{lang === "en" ? "None" : "بدون"}</SelectItem>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{lang === "en" ? "Link to Awareness Session (optional)" : "ربط بجلسة توعوية (اختياري)"}</Label>
                <Select
                  value={formData.awarenessId || ""}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      awarenessId: v || undefined,
                      programId: undefined,
                      programName: v
                        ? sessions.find((s) => s.id === v)?.title || formData.programName
                        : formData.programName,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lang === "en" ? "Select session..." : "اختر جلسة..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{lang === "en" ? "None" : "بدون"}</SelectItem>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{lang === "en" ? "Certificate File (PDF)" : "ملف الشهادة (PDF)"}</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label>{lang === "en" ? "Notes" : "ملاحظات"}</Label>
                <Textarea
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? lang === "en"
                      ? "Saving..."
                      : "جاري الحفظ..."
                    : editingId
                      ? lang === "en"
                        ? "Update Certificate"
                        : "تحديث الشهادة"
                      : lang === "en"
                        ? "Add Certificate"
                        : "إضافة شهادة"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {lang === "en" ? "Cancel" : "إلغاء"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
