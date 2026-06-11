"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import "suneditor/dist/css/suneditor.min.css"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false })

interface RichTextEditorProps {
  initialContent: string
  onSave: (html: string) => Promise<void>
  isSaving: boolean
  title?: string
  onImageUpload?: (file: File) => Promise<string>
}

export function RichTextEditor({
  initialContent,
  onSave,
  isSaving,
  title,
  onImageUpload,
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleSave = useCallback(() => {
    onSave(content)
  }, [content, onSave])

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <SunEditor
          setContents={content}
          onChange={(content: string) => setContent(content)}
          height="600px"
          onImageUploadBefore={(files: File[], _info: object, uploadHandler: (arg: { errorMessage?: string; result: { url: string; name: string; size: number }[] }) => void) => {
            if (!onImageUpload || files.length === 0) {
              return undefined
            }
            onImageUpload(files[0])
              .then((url) => {
                uploadHandler({
                  result: [
                    {
                      url,
                      name: files[0].name,
                      size: files[0].size,
                    },
                  ],
                })
              })
              .catch(() => {
                uploadHandler({ errorMessage: "Image upload failed", result: [] })
              })
            return undefined
          }}
          setOptions={{
            buttonList: [
              ["undo", "redo"],
              ["font", "fontSize", "formatBlock"],
              ["bold", "underline", "italic", "strike", "subscript", "superscript"],
              ["fontColor", "hiliteColor", "textStyle"],
              ["removeFormat"],
              ["outdent", "indent"],
              ["align", "horizontalRule", "list", "table"],
              ["link", "image", "video"],
              ["fullScreen", "showBlocks", "codeView"],
            ],
            minHeight: "400px",
            defaultStyle: "font-family: sans-serif; font-size: 16px;",
            imageAccept: "image/*",
            videoAccept: "video/*",
          }}
        />
      </div>
      {!title && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  )
}
