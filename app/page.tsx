import { getClassificationDefinitions } from "@/lib/classifications-data"
import type { SpecialistCategory } from "@/lib/specialist-types"
import { HeroSection } from "@/components/landing/HeroSection"
import { PortalDiscovery } from "@/components/landing/PortalDiscovery"
import { getTeamExperts } from "@/lib/team-experts"

// Role selections can change after deployment; do not freeze the team at build time.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [catalog, definitions] = await Promise.all([
    getTeamExperts({ all: true })
      .then(experts => ({ experts, error: "" }))
      .catch((error: unknown) => ({ experts: [], error: error instanceof Error ? error.message : "Public expert catalog could not be loaded." })),
    getClassificationDefinitions().catch(() => []),
  ])
  const categories: SpecialistCategory[] = definitions
    .filter((c) => c.is_active && !c.media_only)
    .map((c, order) => ({
      id: c.key,
      key: c.key,
      name_en: c.en,
      name_ar: c.ar,
      order,
      is_active: true,
    }))
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection experts={catalog.experts} catalogError={catalog.error} categories={categories} />

      {/* 3. Portal Discovery */}
      <PortalDiscovery />
    </div>
  )
}
