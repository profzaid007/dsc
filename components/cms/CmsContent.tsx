"use client"

import { sanitizeCmsContent } from "@/lib/sanitize"
import type { Lang } from "@/types/form"

import "suneditor/css/contents"

interface CmsContentProps {
  html: string
  lang: Lang
  className?: string
}

/**
 * Renders raw CMS rich-text HTML exactly as the public site does.
 *
 * This is the single source of truth for CMS content styling. The public
 * routes (app/[slug], app/info/[id], app/blog/[slug]) and the CMS preview
 * dialog all render through here, so a preview can never drift from what
 * visitors actually see.
 */
export function CmsContent({ html, lang, className }: CmsContentProps) {
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={
        "cms-rendered sun-editor-editable space-y-4 leading-relaxed text-gray-700 " +
        "[&_a]:text-blue-600 [&_a]:underline " +
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic " +
        "[&_h1]:my-6 [&_h1]:text-3xl [&_h1]:font-bold " +
        "[&_h2]:my-4 [&_h2]:text-2xl [&_h2]:font-semibold " +
        "[&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-semibold " +
        "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg " +
        "[&_table]:block [&_table]:w-max [&_table]:max-w-full [&_table]:overflow-x-auto " +
        "[&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 " +
        "[&_p]:my-3" +
        (className ? ` ${className}` : "")
      }
      dangerouslySetInnerHTML={{
        __html: sanitizeCmsContent(html, lang),
      }}
    />
  )
}
