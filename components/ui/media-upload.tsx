"use client"

import { useState, useRef } from "react"
import { Upload, X, Image, Video, Music, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { t, UI_STRINGS } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { MediaType, ResponseType } from "@/types/tool"

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const MEDIA_TYPES: {
  value: MediaType
  label: { en: string; ar: string }
  icon: typeof Image
}[] = [
  { value: "image", label: { en: "Image", ar: "صورة" }, icon: Image },
  { value: "video", label: { en: "Video", ar: "فيديو" }, icon: Video },
  { value: "audio", label: { en: "Audio", ar: "صوت" }, icon: Music },
]

const RESPONSE_TYPES: { value: ResponseType; label: { en: string; ar: string } }[] = [
  { value: "text", label: { en: "Text Response", ar: "استجابة نصية" } },
  { value: "video", label: { en: "Video Response", ar: "استجابة فيديو" } },
  { value: "audio", label: { en: "Audio Response", ar: "استجابة صوتية" } },
]

interface MediaUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (data: {
    file: File
    mediaType: MediaType
    responseType: ResponseType
  }) => void
}

export function MediaUpload({
  open,
  onOpenChange,
  onUpload,
}: MediaUploadProps) {
  const { lang } = useLang()
  const [mediaType, setMediaType] = useState<MediaType>("image")
  const [responseType, setResponseType] = useState<ResponseType>("text")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > MAX_SIZE_BYTES) {
      setError(
        t(
          {
            en: `File too large. Max size is ${MAX_SIZE_MB}MB`,
            ar: `الملف كبير جداً. الحد الأقصى للحجم ${MAX_SIZE_MB} ميجابايت`,
          },
          lang
        )
      )
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (!selectedFile) return
    onUpload({ file: selectedFile, mediaType, responseType })
    handleClose()
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setMediaType("image")
    setResponseType("text")
    onOpenChange(false)
  }

  const renderPreview = () => {
    if (!previewUrl) return null

    if (mediaType === "image") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img
            src={previewUrl}
            alt={t({ en: "Preview", ar: "معاينة" }, lang)}
            className="h-full w-full object-contain"
          />
        </div>
      )
    }

    if (mediaType === "video") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <video src={previewUrl} className="h-full w-full object-contain" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      )
    }

    if (mediaType === "audio") {
      return (
        <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-8">
          <div className="flex flex-col items-center gap-2">
            <Music className="h-12 w-12 text-muted-foreground" />
            <audio src={previewUrl} controls className="w-full" />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t({ en: "Upload Media", ar: "رفع وسائط" }, lang)}
          </DialogTitle>
          <DialogDescription>
            {t(
              {
                en: `Add image, video, or audio (max ${MAX_SIZE_MB}MB)`,
                ar: `أضف صورة أو فيديو أو صوت (بحد أقصى ${MAX_SIZE_MB} ميجابايت)`,
              },
              lang
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t({ en: "Media Type", ar: "نوع الوسائط" }, lang)}</Label>
              <Select
                value={mediaType}
                onValueChange={(v) => setMediaType(v as MediaType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {t(type.label, lang)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {t({ en: "Response Type", ar: "نوع الاستجابة" }, lang)}
              </Label>
              <Select
                value={responseType}
                onValueChange={(v) => setResponseType(v as ResponseType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedFile && (
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept={
                  mediaType === "image"
                    ? "image/*"
                    : mediaType === "video"
                      ? "video/*"
                      : "audio/*"
                }
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {selectedFile && (
            <div className="space-y-3">
              {renderPreview()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                  }
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                <X className="me-2 h-4 w-4" />
                {t(
                  {
                    en: "Remove & Upload Different",
                    ar: "إزالة ورفع ملف مختلف",
                  },
                  lang
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t(UI_STRINGS.cancel, lang)}
          </Button>
          <Button onClick={handleSave} disabled={!selectedFile}>
            {t({ en: "Add Media", ar: "إضافة وسائط" }, lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
