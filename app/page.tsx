"use client"
import { HeroSection } from "@/components/landing/HeroSection"
import { ServiceJourney } from "@/components/landing/ServiceJourney"
import { PortalDiscovery } from "@/components/landing/PortalDiscovery"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Service Journey */}
      <ServiceJourney />

      {/* 3. Portal Discovery */}
      <PortalDiscovery />
    </div>
  )
}
