import { sanitizeCmsContent } from "@/lib/sanitize"

import Link from "next/link"
import { cookies } from "next/headers"
import pb from "@/lib/pb"
import { localizedField, t } from "@/lib/i18n"
import type { InfoPage } from "@/types/cms"
import type { Lang } from "@/types/form"
import "suneditor/css/contents"
import { getPortalById } from "@/lib/portals"
import { Button } from "@/components/ui/button"
interface InfoPageProps {
  params: Promise<{ id: string }>
}



export default async function InfoPage({ params }: InfoPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"
  let record: Record<string, unknown> | null = null
  try {
    record = await pb
      .collection("info_pages")
      .getFirstListItem(`slug = "${id}"`)
  } catch {
    // Record not found
  }

  const page = record as InfoPage | null
  const isPublished = !!page?.is_published
  const portalId = page?.portal_name
  const infoPortal = portalId ? getPortalById(portalId) : undefined
  const backHref = portalId ? `/portal/${portalId}` : "/"
  const title = page ? localizedField(page, lang, "title") : ""
  const displayTitle = title || id.replace(/-/g, " ")

  if (record && page && isPublished) {
    const iconFile = page.icon
    const iconUrl = iconFile ? pb.files.getUrl(record, iconFile) : null

    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href={backHref}
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          {t({ en: "\u2190 Back", ar: "\u0631\u062C\u0648\u0639 \u2192" }, lang)}
        </Link>
        {iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt=""
            className="mb-6 h-16 w-16 rounded-xl object-contain"
          />
        )}
        <h1 className="mb-8 text-3xl font-bold capitalize">{displayTitle}</h1>
        <div
          className="cms-rendered sun-editor-editable space-y-4 text-gray-700 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: sanitizeCmsContent(localizedField(page, lang, "content")) }}
        />

        <div className="tet">{infoPortal && (
              <a href={infoPortal.ctaHref}>
                <Button size="lg" className="px-4 py-3 text-xs lg:px-8 lg:py-6 lg:text-base font-semibold shadow-lg"
                        style={{ backgroundColor: infoPortal.accent, color: "#fff" }}>
                  {t(infoPortal.ctaLabel, lang)}
                </Button>
              </a>
            )}</div>
      </div>
    )
  }

  // If not published or missing → show coming soon
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={backHref}
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        {t({ en: "\u2190 Back", ar: "\u0631\u062C\u0648\u0639 \u2192" }, lang)}
      </Link>
      <h1 className="mb-4 text-3xl font-bold capitalize">{displayTitle}</h1>
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg text-muted-foreground">
          {t({ en: "Coming soon", ar: "قريباً" }, lang)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t({ en: "This page is being prepared. Check back later.", ar: "هذه الصفحة قيد الإعداد. تحقق لاحقاً." }, lang)}
        </p>
      </div>
      {infoPortal && (
        <div className="text-center">
          <a href={infoPortal.ctaHref}>
            <Button size="lg" className="px-4 py-3 text-xs lg:px-8 lg:py-6 lg:text-base font-semibold shadow-lg"
                    style={{ backgroundColor: infoPortal.accent, color: "#fff" }}>
              {t(infoPortal.ctaLabel, lang)}
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
