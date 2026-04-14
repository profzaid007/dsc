"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DragList } from "@/components/ui/drag-list"
import { MediaUpload } from "@/components/ui/media-upload"
import { MediaPreview } from "@/components/tool-renderers/MediaPreview"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Image,
  Video,
  Music,
  Play,
} from "lucide-react"
import type {
  MediaConfig,
  MediaItem,
  MediaType,
  ResponseType,
} from "@/types/tool"
import { useToolTypes } from "@/hooks/useToolTypes"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface MediaBuilderPageProps {
  params?: Promise<{ id?: string }>
}

export default function MediaBuilderPage({
  params,
}: MediaBuilderPageProps = {}) {
  const router = useRouter()
  const {
    addTool,
    updateTool,
    getToolById,
    isLoading: isToolsLoading,
  } = useTools()
  const { fetchToolTypes } = useToolTypes()
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  // Edit mode detection
  const resolvedParams = params ? use(params) : undefined
  const editId = resolvedParams?.id
  const isEditMode = !!editId

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
  })

  const [items, setItems] = useState<MediaItem[]>([])

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && editId && !isToolsLoading) {
      setIsLoading(true)
      const tool = getToolById(editId)
      if (tool && tool.config) {
        const config = tool.config as MediaConfig
        setFormData({
          nameEn: tool.name.en,
          nameAr: tool.name.ar,
        })
        setItems(config.items || [])
      }
      setIsLoading(false)
    }
  }, [isEditMode, editId, isToolsLoading])

  const addItem = () => {
    setUploadOpen(true)
  }

  const handleMediaUpload = (data: {
    mediaData: string
    mediaType: MediaType
    responseType: ResponseType
  }) => {
    const newItem: MediaItem = {
      id: generateId(),
      question: "",
      mediaType: data.mediaType,
      mediaData: data.mediaData,
      responseType: data.responseType,
      order: items.length,
    }
    setItems([...items, newItem])
  }

  const updateItem = (id: string, updates: Partial<MediaItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleReorder = (reordered: MediaItem[]) => {
    setItems(reordered)
  }

  const handleSubmit = async () => {
    if (!formData.nameEn || items.length === 0) return
    setIsSubmitting(true)

    const config: MediaConfig = {
      title: { en: formData.nameEn, ar: formData.nameAr },
      items: items.map((item, idx) => ({ ...item, order: idx })),
      media: [],
    }

    if (isEditMode && editId) {
      await updateTool(editId, {
        name: { en: formData.nameEn, ar: formData.nameAr },
        config,
      })
      router.push(`/dashboard/admin/tools/media/${editId}`)
    } else {
      
      const toolTypes = await fetchToolTypes()
      const type = toolTypes.find((t) => t.name === "media_question")?.id

      await addTool({
        name: { en: formData.nameEn, ar: formData.nameAr },
        type: type,
        serviceType: "individual",
        status: "active",
        config,
      })
      router.push(`/dashboard/admin/tools`)
    }
  }

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case "image":
        return Image
      case "video":
        return Video
      case "audio":
        return Music
    }
  }

  const renderItemPreview = (item: MediaItem, index: number) => {
    const Icon = getMediaIcon(item.mediaType)

    return (
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">Item {index + 1}</span>
            <Badge variant="outline" className="text-xs">
              {item.mediaType}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/30 p-2">
          {item.mediaType === "image" && (
            <img
              src={item.mediaData}
              alt="Preview"
              className="h-32 w-full rounded object-cover"
            />
          )}
          {item.mediaType === "video" && (
            <div className="relative flex h-32 w-full items-center justify-center rounded bg-black">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
          {item.mediaType === "audio" && (
            <div className="flex h-12 items-center justify-center rounded bg-muted">
              <Music className="h-6 w-6" />
            </div>
          )}
        </div>

        <Input
          placeholder="Question"
          value={item.question}
          onChange={(e) => updateItem(item.id, { question: e.target.value })}
        />

        <div className="text-sm text-muted-foreground">
          Response:{" "}
          <span className="font-medium capitalize">{item.responseType}</span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {isEditMode ? "Edit" : "Create"} Media Questions
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Update media questions"
                : "Add questions with image/video/audio"}
            </p>
          </div>
        </div>
        <Button
          variant={showPreview ? "default" : "outline"}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <EyeOff className="me-2 h-4 w-4" />
          ) : (
            <Eye className="me-2 h-4 w-4" />
          )}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
      </div>

      <div
        className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (EN)</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    placeholder="Media quiz title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (AR)</Label>
                  <Input
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData({ ...formData, nameAr: e.target.value })
                    }
                    placeholder="عنوان الاختبار"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Media Items</CardTitle>
              <Button size="sm" onClick={addItem}>
                <Plus className="me-2 h-4 w-4" />
                Add Media
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  No media items yet. Click "Add Media" to upload.
                </p>
              ) : (
                <DragList
                  items={items}
                  onReorder={handleReorder}
                  renderItem={renderItemPreview}
                  keyExtractor={(item) => item.id}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nameEn || items.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create"}
            </Button>
          </div>
        </div>

        {showPreview && (
          <div className="sticky top-6 max-h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-card p-4">
            <p className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Live Preview
            </p>
            <MediaPreview
              config={{
                title: { en: formData.nameEn, ar: formData.nameAr },
                items,
                media: [],
              }}
            />
          </div>
        )}
      </div>

      <MediaUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleMediaUpload}
      />
    </div>
  )
}
