import { ALLOCATION_ROLE_GROUPS } from "@/lib/allocation-role-groups"
import type { SpecialistCategory } from "@/lib/specialist-types"
import { HeroSection } from "@/components/landing/HeroSection"
import { PortalDiscovery } from "@/components/landing/PortalDiscovery"
import { getTeamExperts } from "@/lib/team-experts"

export default async function HomePage() {
  const experts = await getTeamExperts({ all: true })
  const categories: SpecialistCategory[] = ALLOCATION_ROLE_GROUPS.map((group, order) => ({
    id: group.id,
    key: group.id,
    name_en: group.en,
    name_ar: group.ar,
    order,
    is_active: true,
  }))
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection experts={experts} categories={categories} />

      {/* 3. Portal Discovery */}
      <PortalDiscovery />
    </div>
  )
}
