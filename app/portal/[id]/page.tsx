import { notFound } from "next/navigation"
import { t } from "@/lib/i18n"
import { getPortalById, PORTALS } from "@/lib/portals"
import { Button } from "@/components/ui/button"

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
      <section
        className="py-20 text-center"
        style={{
          background: `linear-gradient(135deg, ${portal.accent}15, ${portal.secondary}10)`,
        }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
            {t(portal.heroTitle, "en")}
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {t(portal.heroText, "en")}
          </p>
          <a href={portal.ctaHref}>
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold shadow-lg"
              style={{ backgroundColor: portal.accent, color: "#fff" }}
            >
              {t(portal.ctaLabel, "en")}
            </Button>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="mb-8 text-center text-2xl font-bold">Our Services</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portal.services.map((service, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              style={{ borderColor: `${portal.accent}30` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: portal.accent }}
                />
                <span className="font-medium">{service.en}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export async function generateStaticParams() {
  return PORTALS.map((portal) => ({ id: portal.id }))
}