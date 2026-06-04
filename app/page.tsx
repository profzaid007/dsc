"use client"
import Link from "next/link"
import { useLang } from "@/lib/lang-context"
import { t } from "@/lib/i18n"
import { PORTALS } from "@/lib/portals"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

const PORTAL_COLORS: Record<string, { accent: string; bg: string }> = {
  "1": { accent: "#008f53", bg: "bg-[#e2f3ec]" },
  "2": { accent: "#631a7b", bg: "bg-[#f3eafa]" },
  "4": { accent: "#df9b00", bg: "bg-[#fef4e2]" },
  "5": { accent: "#0f3090", bg: "bg-[#e6ecfa]" },
  "6": { accent: "#121e31", bg: "bg-[#e2e7ec]" },
}

function PortalCard({ portal }: { portal: (typeof PORTALS)[number] }) {
  const { lang } = useLang()
  const colors = PORTAL_COLORS[portal.id] ?? { accent: "#0a3d62", bg: "bg-muted" }
  return (
    <Card className="group relative w-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col items-center p-3">
        <div className="mb-3 flex h-16 w-16 items-center justify-center">
          {portal.id === "1" ? (
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-white font-bold text-xs border-2"
              style={{ backgroundColor: "#0a1128", borderColor: colors.accent }}
            >
              DSC
            </div>
          ) : (
            <div className="mb-5">
              <div className="rounded-lg py-4 px-4 text-center text-sm font-bold text-white"
                 style={{ backgroundColor: `${colors.accent}12`, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
                {portal.title}
              </div>
            </div>
          )}
        </div>
        <div className="relative mb-3 h-52 w-full overflow-hidden rounded-lg">
          <Image
            src={portal.image}
            alt={portal.portalName.en}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>
        <Link href={`/portal/${portal.id}`} className="w-full">
          <Button
            className="w-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
          >
            {t({ en: "Enter Portal", ar: "الدخول للبوابة" }, lang)}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default function HomePage() {
  const { lang } = useLang()

  return (
    <div className="flex min-h-screen flex-col">
      <section className="py-12 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#0b2545] md:text-4xl">
            {t(
              {
                en: "FROM WHERE YOU WANT TO START YOUR JOURNEY?",
                ar: "من أين تريد أن تبدأ رحلتك؟",
              },
              lang
            )}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t(
              {
                en: "Choose the path that fits your goals, and let DSC transform scientific assessment into measurable results in the age of digital transformation and AI.",
                ar: "اختر المسار الذي يناسب أهدافك، دع DSC يحول التقييم العلمي إلى نتائج قابلة للقياس في عصر التحول الرقمي والذكاء الاصطناعي.",
              },
              lang
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] flex-1 px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {PORTALS.map((portal) => (
            <PortalCard key={portal.id} portal={portal} />
          ))}
        </div>
      </section>
    </div>
  )
}
