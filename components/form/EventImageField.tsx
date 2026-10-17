"use client"
import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { useLang } from "@/lib/lang-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateEventImage } from "@/lib/event-image"

export function EventImageField({value, onChange, disabled}: {
  value?: string | File
  onChange: (file: File) => void
  disabled?: boolean
}) {
  const {lang} = useLang()
  const id = useId()
  const objectUrl = useRef<string | null>(null)
  const [preview, setPreview] = useState<string>()
  const [error, setError] = useState("")
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
  }, [])
  const image = typeof value === "string" ? value : preview
  return <Card>
    <CardHeader><CardTitle>{lang === "ar" ? "صورة الفعالية" : "Event image"}</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      {image && <div className="relative h-56 w-full overflow-hidden rounded-lg bg-muted">
        <Image src={image} alt={lang === "ar" ? "معاينة صورة الفعالية" : "Event image preview"} fill unoptimized className="object-contain" />
      </div>}
      <Label htmlFor={id}>{lang === "ar" ? "رفع صورة أو استبدال الصورة الحالية" : "Upload or replace image"}</Label>
      <Input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`} aria-invalid={!!error}
        onChange={event => {
          const file = event.target.files?.[0]
          if (!file) return
          const problem = validateEventImage(file)
          if (problem) {
            setError(problem === "size" ? (lang === "ar" ? "حجم الصورة يجب ألا يتجاوز 5 ميجابايت" : "Image must be 5 MB or smaller") : (lang === "ar" ? "اختر صورة بصيغة JPG أو PNG أو WebP أو GIF" : "Choose a JPG, PNG, WebP or GIF image"))
            event.target.value = ""
            return
          }
          setError("")
          if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
          objectUrl.current = URL.createObjectURL(file)
          setPreview(objectUrl.current)
          onChange(file)
        }} />
      <p id={`${id}-help`} className="text-sm text-muted-foreground">{lang === "ar" ? "اختياري. JPG أو PNG أو WebP أو GIF، بحد أقصى 5 ميجابايت. تُرفع الصورة عند حفظ الفعالية." : "Optional. JPG, PNG, WebP or GIF, up to 5 MB. The image uploads when you save the event."}</p>
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </CardContent>
  </Card>
}
