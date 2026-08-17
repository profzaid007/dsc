import { notFound } from "next/navigation"
import { t, localizedField } from "@/lib/i18n"
import { getPortalById, PORTALS } from "@/lib/portals"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import pb from "@/lib/pb"
import Image from "next/image"
import Link from "next/link"
import { cookies } from "next/headers"
import type { Lang } from "@/types/form"

interface PortalPageProps {
  params: Promise<{ id: string }>
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value as Lang) || "en"
  const portal = getPortalById(id)

  if (!portal) {
    notFound()
  }

  const publishedPages = await pb
    .collection("info_pages")
    .getFullList({
      filter: `portal_name = "${id}" && is_published = true`,
    })

  return (
    <div className="min-h-screen">
      <section className="grid w-full min-h-[300px] lg:min-h-[600px] grid-cols-2">
        <div className="flex items-center px-4 lg:px-12"
             style={{ backgroundColor: portal.accent }}>
          <div className="max-w-lg">
            <h2 className="mb-4 text-1xl lg:text-4xl font-bold tracking-tight text-white">
              {t(portal.heroTitle, lang)}
            </h2>
            <p className="mb-8 text-sm lg:text-xl text-white/80">
              {t(portal.heroText, lang)}
            </p>
            <a href={portal.ctaHref}>
              <Button size="lg" className="px-4 py-3 text-xs lg:px-8 lg:py-6 lg:text-base font-semibold shadow-lg"
                      style={{ backgroundColor: "white", color: portal.accent }}>
                {t(portal.ctaLabel, lang)}
              </Button>
            </a>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <Image
            src={portal.banner}
            alt={t(portal.portalName, lang)}
            fill
            className="object-cover object-[20%_center] lg:object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0"
               style={{ background: `linear-gradient(90deg, ${portal.accent}FF 0%, transparent 50%)` }} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="mb-8 text-center text-2xl font-bold">
          {t({ en: "Our Services", ar: "خدماتنا" }, lang)}
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {publishedPages.map((record) => {
          const iconFile = record.icon as string
          const iconUrl = iconFile ? pb.files.getUrl(record, iconFile) : null
          return (
            <Link key={record.id} href={`/info/${record.slug}`} className="block rounded-lg border p-4 transition-shadow hover:shadow-md" style={{ borderColor: `${portal.accent}30` }}>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                >
                  {iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={iconUrl} alt="" className="h-10 w-10 object-contain" />
                  ) : (
                    <FileText className="h-8 w-8" style={{ color: portal.accent }} />
                  )}
                </div>
                <span className="text-center text-sm font-medium leading-snug">
                  {localizedField(record, lang, "title")}
                </span>
              </div>
            </Link>
          )
        })}
        </div>
      </section>
    </div>
  )
}

export async function generateStaticParams() {
  return PORTALS.map((portal) => ({ id: portal.id }))
}
