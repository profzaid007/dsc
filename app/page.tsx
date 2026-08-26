"use client"
import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { PORTALS } from "@/lib/portals"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { HeroSection } from "@/components/landing/HeroSection"
import { ServiceJourney } from "@/components/landing/ServiceJourney"

const PORTAL_COLORS: Record<string, { accent: string; bg: string }> = {
  "1": { accent: "#008f53", bg: "bg-[#e2f3ec]" },
  "2": { accent: "#631a7b", bg: "bg-[#f3eafa]" },
  "3": { accent: "#df9b00", bg: "bg-[#fef4e2]" },
  "4": { accent: "#0f3090", bg: "bg-[#e6ecfa]" },
  "5": { accent: "#121e31", bg: "bg-[#e2e7ec]" },
}

function PortalCard({ portal, index }: { portal: (typeof PORTALS)[number]; index: number }) {
  const { lang } = useLang()
  const colors = PORTAL_COLORS[portal.id] ?? { accent: "#0a3d62", bg: "bg-muted" }
  return (
    <Card
      className="animate-fade-in-up group relative w-full overflow-hidden rounded-xl border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col items-center p-4">
        <div className="mb-3 flex h-16 w-16 items-center justify-center">
          <div className="rounded-lg px-4 py-4 text-center text-sm font-bold" style={{ color: colors.accent }}>
            {t(portal.title, lang)}
          </div>
        </div>
        <div className="relative mb-4 h-52 w-full overflow-hidden rounded-lg">
          <Image
            src={portal.image}
            alt={portal.portalName.en}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>
        <Link href={`/portal/${portal.id}`} className="w-full">
          <Button
            className="w-full rounded-lg text-sm font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
          >
            {t({ en: "Enter Portal", ar: "الدخول للبوابة" }, lang)}
          </Button>
        </Link>
      </div>
      {/* Colored top border accent */}
      <div
        className="absolute left-0 top-0 h-1 w-full transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: colors.accent }}
      />
    </Card>
  )
}

export default function HomePage() {
  const { lang } = useLang()

  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Service Journey */}
      <ServiceJourney />

      {/* 3. Portal Cards */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-12 text-center">
            <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight text-[#0b2545] md:text-4xl">
              {t(
                {
                  en: "Where do you want to start your journey?",
                  ar: "من أين تريد أن تبدأ رحلتك؟",
                },
                lang
              )}
            </h2>
            <p className="animate-fade-in-up delay-200 mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              {t(
                {
                  en: "Choose the path that fits your goals, and let DSC transform scientific assessment into measurable results in the age of digital transformation and AI.",
                  ar: "اختر المسار الذي يناسب أهدافك، دع DSC يحول التقييم العلمي إلى نتائج قابلة للقياس في عصر التحول الرقمي والذكاء الاصطناعي.",
                },
                lang
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {PORTALS.map((portal, i) => (
              <PortalCard key={portal.id} portal={portal} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
