import { notFound } from "next/navigation"
import { t } from "@/lib/i18n"
import { getPortalById, PORTALS } from "@/lib/portals"
import { Button } from "@/components/ui/button"
import { icons } from "lucide-react"
import Image from "next/image"

interface PortalPageProps {
  params: Promise<{ id: string }>
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { id } = await params
  const portal = getPortalById(id)

  if (!portal) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <section className="grid w-full min-h-[600px] grid-cols-2">
        {/* Left — accent color + content */}
        <div className="flex items-center px-12"
             style={{ backgroundColor: portal.accent }}>
          <div className="max-w-lg">
            <h2 className="mb-4 text-5xl font-bold tracking-tight text-white">
              {t(portal.heroTitle, "en")}
            </h2>
            <p className="mb-8 text-xl text-white/80">
              {t(portal.heroText, "en")}
            </p>
            <a href={portal.ctaHref}>
              <Button size="lg" className="px-8 py-6 text-base font-semibold shadow-lg"
                      style={{ backgroundColor: "white", color: portal.accent }}>
                {t(portal.ctaLabel, "en")}
              </Button>
            </a>
          </div>
        </div>
        {/* Right — image with gradient blend */}
        <div className="relative overflow-hidden">
          <Image
            src={portal.banner}
            alt={portal.portalName.en}
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0"
               style={{ background: `linear-gradient(90deg, ${portal.accent}FF 0%, transparent 50%)` }} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="mb-8 text-center text-2xl font-bold">Our Services</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {portal.services.map((service, i) => {
          const iconKey = service.icon.charAt(0).toUpperCase() + service.icon.slice(1)
          const Icon = icons[iconKey as keyof typeof icons]
          return (
            <div className="rounded-lg border p-4 transition-shadow hover:shadow-md" style={{ borderColor: `${portal.accent}30` }}>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                >
                  {Icon && <Icon className="h-8 w-8" style={{ color: portal.accent }} />}
                </div>
                <span className="text-center text-sm font-medium leading-snug">
                  {service.name.en}
                </span>
              </div>
            </div>
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
