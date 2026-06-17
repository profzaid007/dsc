"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save, RotateCcw } from "lucide-react"

import "suneditor/css/editor"
import "suneditor/css/contents"
import "codemirror/lib/codemirror.css"

interface RichTextEditorProps {
  initialContent: string
  onSave: (html: string) => Promise<void>
  isSaving: boolean
  title?: string
  onDiscard?: () => void
  onImageUpload?: (file: File) => Promise<string>
  resetTrigger?: number
}

export function RichTextEditor({
  initialContent,
  onSave,
  isSaving,
  title,
  onImageUpload,
  onDiscard,
  resetTrigger
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const onImageUploadRef = useRef(onImageUpload)
  const lastSyncedInitialContent = useRef<string>("")
  const [content, setContent] = useState(initialContent)

  // Keep callback ref up-to-date without re-creating the editor
  useEffect(() => {
    onImageUploadRef.current = onImageUpload
  }, [onImageUpload])

  // Create editor once on mount
  useEffect(() => {
    let instance: any

    const init = async () => {
      if (!containerRef.current) return

      containerRef.current.innerHTML = ""
      const textarea = document.createElement("textarea")
      containerRef.current.appendChild(textarea)

      const [{ default: suneditor, plugins }, { default: CodeMirror }] =
        await Promise.all([import("suneditor"), import("codemirror")])

      if (!textarea.parentNode) return

      instance = suneditor.create(textarea, {
        plugins,
        externalLibs: {
          codeMirror: { src: CodeMirror },
        },
        toolbar_sticky: 93,
        value: initialContent,
        height: "600px",
        minHeight: "400px",
        buttonList: [
          ["undo", "redo"],
          "|",
          ["blockStyle", "font", "fontSize"],
          "|",
          ["bold", "italic", "underline", "strike", "subscript", "superscript"],
          "|",
          ["fontColor", "backgroundColor"],
          "|",
          ["textStyle"],
          "|",
          ["removeFormat"],
          "/",
          ["outdent", "indent", "align", "list"],
          "|",
          ["hr", "table", "link", "image", "video"],
          "|",
          ["fullScreen", "showBlocks", "codeView"],
        ],
        events: {
          onChange: (params: { data: string }) => {
            setContent(params.data)
          },
          onImageUploadBefore: async (params: any) => {
            const { info } = params
            const uploadHandler = onImageUploadRef.current

            // URL upload (not a file) – let v3 handle it normally
            if (info.url && !(info.files instanceof FileList)) {
              return true
            }

            // No custom uploader – let v3 fall back to base64/default behaviour
            if (!uploadHandler || !info.files || info.files.length === 0) {
              return true
            }

            try {
              const url = await uploadHandler(info.files[0])
              const imagePlugin = instance.$.plugins.image
              imagePlugin.create(
                url,
                null,
                "auto",
                "auto",
                "",
                { name: info.files[0].name, size: info.files[0].size },
                "",
                true
              )
              imagePlugin.modal.close()
              return false
            } catch (error) {
              console.error("Image upload failed:", error)
              return false
            }
          },
        },
      })

      editorRef.current = instance
    }

    init()

    return () => {
      // Fallback: destroy if useLayoutEffect hasn't already (e.g. effect re-run)
      if (instance && editorRef.current === instance) {
        try {
          instance.destroy()
        } catch {
          // DOM already detached; manual cleanup not critical here because
          // useLayoutEffect's cleanup will run after this with full fallback.
        }
        editorRef.current = null
      }
    }
  }, []) // run once

  // Update editor content when initialContent prop changes
  useEffect(() => {
    if (editorRef.current && initialContent !== lastSyncedInitialContent.current) {
      editorRef.current.$.html.set(initialContent)
      setContent(initialContent)
      lastSyncedInitialContent.current = initialContent
    }
  }, [resetTrigger, initialContent])

  // Destroy editor BEFORE React removes the DOM.
  // useLayoutEffect cleanup runs synchronously before DOM mutations,
  // so the textarea and editor DOM are still attached when destroy() runs.
  useLayoutEffect(() => {
    return () => {
      const instance = editorRef.current
      if (!instance) return

      try {
        // Pre-emptively handle CodeMirror to prevent the toTextArea error.
        // If the wrapper is already detached, we skip CM cleanup (React will
        // remove it anyway) so destroy() can proceed past step 1.
        try {
          const hasCM = instance.$.options?.get?.("hasCodeMirror")
          if (hasCM && instance.$.contextProvider?.applyToRoots) {
            instance.$.contextProvider.applyToRoots((e: any) => {
              const cm = e.get("options").get("codeMirrorEditor")
              if (cm?.display?.wrapper?.isConnected) {
                cm.toTextArea()
              }
            })
          }
        } catch {}

        instance.destroy()
      } catch {
        // destroy() still hit an error.  Perform critical memory cleanup manually.
        if (instance.events) {
          for (const k in instance.events) instance.events[k] = null
          instance.events = null
        }
        try {
          instance.$.kernel?._destroy?.()
        } catch {}
      }

      editorRef.current = null
    }
  }, [])

  const handleSave = useCallback(() => {
    const currentContent = editorRef.current
      ? editorRef.current.$.html.get()
      : content
    onSave(currentContent)
  }, [content, onSave])

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {onDiscard && (
              <Button variant="outline" onClick={onDiscard}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Discard Changes
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
      <div ref={containerRef} className="rounded-md border" />
      {!title && (
        <div className="flex justify-end gap-2">
          {onDiscard && (
            <Button variant="outline" onClick={onDiscard}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Discard Changes
            </Button>
          )}
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
