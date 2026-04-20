"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { SITE_CONTENT } from "@/lib/site-content"

export function HeroSection() {
  const { lang } = useLang()

  return (
    <section
      id="hero"
      className="relative -mt-16 flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          poster="/hero-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10, 61, 98, 0.85), rgba(60, 141, 188, 0.75), rgba(201, 162, 39, 0.6))",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
          {t(SITE_CONTENT.hero.headline, lang)}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-100 md:text-xl">
          {t(SITE_CONTENT.hero.subheadline, lang)}
        </p>

        <div className="mt-10">
          <Link href="/apply">
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
            >
              {t(SITE_CONTENT.hero.cta, lang)}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
