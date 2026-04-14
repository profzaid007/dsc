"use client"

import { useState } from "react"
import { useLang } from "@/lib/lang-context"
import type { MediaConfig, MediaItem } from "@/types/tool"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface MediaPreviewProps {
  config: MediaConfig
}

export function MediaPreview({ config }: MediaPreviewProps) {
  const { lang } = useLang()
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [playingId, setPlayingId] = useState<string | null>(null)

  const sortedItems = [...config.items].sort((a, b) => a.order - b.order)

  const handleResponse = (itemId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [itemId]: value }))
  }

  const renderMedia = (item: MediaItem) => {
    if (item.mediaType === "image") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img
            src={item.mediaData}
            alt="Media"
            className="h-full w-full object-contain"
          />
        </div>
      )
    }
    if (item.mediaType === "video") {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <video
            src={item.mediaData}
            className="h-full w-full object-contain"
          />
        </div>
      )
    }
    if (item.mediaType === "audio") {
      return (
        <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-4">
          <audio src={item.mediaData} controls className="w-full" />
        </div>
      )
    }
    return null
  }

  if (sortedItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No media items yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{config.title[lang]}</h3>
      {sortedItems.map((item) => (
        <div key={item.id} className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-start gap-2">
            <Label className="font-medium">
              {item.question || "No question text"}
            </Label>
          </div>
          {renderMedia(item)}
          <div>
            <Label className="text-sm text-muted-foreground">
              Response Type:{" "}
              <span className="capitalize">{item.responseType}</span>
            </Label>
            {item.responseType === "text" && (
              <Input
                placeholder={
                  lang === "ar" ? "اكتب إجابتك..." : "Type your answer..."
                }
                value={responses[item.id] || ""}
                onChange={(e) => handleResponse(item.id, e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      ))}
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="mb-2 text-sm font-medium">Responses:</p>
        <pre className="overflow-auto text-xs">
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    </div>
  )
}
