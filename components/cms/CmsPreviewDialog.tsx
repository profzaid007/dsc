"use client"

import { Eye, TriangleAlert } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CmsContent } from "@/components/cms/CmsContent"
import { UI_STRINGS, t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { Lang } from "@/types/form"

interface CmsPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Title shown in the preview's <h1>, mirroring the public page. */
  title: string
  /** Raw rich-text HTML, straight from the editor buffer (may be unsaved). */
  html: string
  /** The language being previewed — normally the editor's active tab. */
  lang: Lang
  /** Public path this content will be served from, shown for reference. */
  path?: string
  /** Content-type specific chrome, e.g. a blog category badge or page icon. */
  children?: React.ReactNode
}

/**
 * Renders CMS content in a large dialog using the exact same markup as the
 * public site, so editors can check layout and RTL before saving.
 *
 * Intentionally shows the current editor buffer, including unsaved changes —
 * that is the whole point of a preview.
 */
export function CmsPreviewDialog({
  open,
  onOpenChange,
  title,
  html,
  lang,
  path,
  children,
}: CmsPreviewDialogProps) {
  const { lang: siteLang } = useLang()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b bg-muted/50 px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t(UI_STRINGS.preview, siteLang)}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-2 border-b bg-amber-50 px-6 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
            <span>
              {t(
                {
                  en: "Preview of unsaved content — visitors cannot see this yet.",
                  ar: "معاينة للمحتوى غير المحفوظ — لا يمكن للزوار رؤيته بعد.",
                },
                siteLang
              )}
            </span>
          </div>

          {path && (
            <div className="border-b bg-muted/30 px-6 py-2 font-mono text-xs text-muted-foreground">
              {path}
            </div>
          )}

          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="mx-auto max-w-4xl px-6 py-12"
          >
            {children}
            <h1 className="mb-8 text-3xl font-bold capitalize">{title}</h1>
            <CmsContent html={html} lang={lang} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
