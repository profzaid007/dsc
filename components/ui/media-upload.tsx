"use client"

import { useState, useRef } from "react"
import { Upload, X, Image, Video, Music, Play, Loader2 } from "lucide-react"
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
import type { MediaType, ResponseType } from "@/types/tool"

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const MEDIA_TYPES: { value: MediaType; label: string; icon: typeof Image }[] = [
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
]

const RESPONSE_TYPES: { value: ResponseType; label: string }[] = [
  { value: "text", label: "Text Response" },
  { value: "video", label: "Video Response" },
  { value: "audio", label: "Audio Response" },
]

interface MediaUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (data: {
    mediaData: string
    mediaType: MediaType
    responseType: ResponseType
  }) => void
}

export function MediaUpload({
  open,
  onOpenChange,
  onUpload,
}: MediaUploadProps) {
  const [mediaType, setMediaType] = useState<MediaType>("image")
  const [responseType, setResponseType] = useState<ResponseType>("text")
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File too large. Max size is ${MAX_SIZE_MB}MB`)
      return
    }

    setIsLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
        setIsLoading(false)
      }
      reader.onerror = () => {
        setError("Failed to read file")
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError("Failed to process file")
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    if (!preview) return
    onUpload({ mediaData: preview, mediaType, responseType })
    handleClose()
  }

  const handleClose = () => {
    setPreview(null)
    setError(null)
    setMediaType("image")
    setResponseType("text")
    onOpenChange(false)
  }

  const renderPreview = () => {
    if (!preview) return null

    if (mediaType === "image") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain"
          />
        </div>
      )
    }

    if (mediaType === "video") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <video src={preview} className="h-full w-full object-contain" />
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
            <audio src={preview} controls className="w-full" />
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
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Add image, video, or audio (max {MAX_SIZE_MB}MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Media Type</Label>
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
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Response Type</Label>
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
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!preview && (
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
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              {renderPreview()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                <X className="me-2 h-4 w-4" />
                Remove & Upload Different
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!preview}>
            Add Media
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
