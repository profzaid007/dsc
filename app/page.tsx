import pb from "@/lib/pb"
import { boundedFullList } from "@/lib/bounded-records"
import type { SpecialistCategory } from "@/lib/specialist-types"
import { HeroSection } from "@/components/landing/HeroSection"
import { PortalDiscovery } from "@/components/landing/PortalDiscovery"
import { getTeamExperts } from "@/lib/team-experts"

export default async function HomePage() {
  const [experts, categoryRecords] = await Promise.all([
    getTeamExperts({ all: true }),
    boundedFullList(pb.collection("specialist_role_categories"), { sort: "order,name_en", filter: "is_active = true" }).catch(() => []),
  ])
  const categories = categoryRecords as unknown as SpecialistCategory[]
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection experts={experts} categories={categories} />

      {/* 3. Portal Discovery */}
      <PortalDiscovery />
    </div>
  )
}
