"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { SITE_CONTENT } from "@/lib/site-content"

export function HeroSection() {
  const { lang } = useLang()

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 z-0 bg-[#0a2540]" />

      {/* Subtle color overlay */}
      <div
        className="animate-hero-gradient absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,61,98,0.55), rgba(26,82,118,0.4), rgba(46,134,193,0.25), rgba(60,141,188,0.2), rgba(201,162,39,0.12))",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating decorative shapes */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        <div className="animate-float absolute left-[10%] top-[20%] h-16 w-16 rounded-full border border-white/10 bg-white/5" />
        <div className="animate-float delay-300 absolute right-[15%] top-[30%] h-10 w-10 rounded-full border border-white/10 bg-white/5" />
        <div className="animate-float delay-500 absolute bottom-[25%] left-[20%] h-12 w-12 rounded-full border border-white/10 bg-white/5" />
        <div className="animate-float delay-700 absolute bottom-[35%] right-[10%] h-8 w-8 rounded-full border border-white/10 bg-white/5" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Logo with animated rings */}
        <div className="animate-fade-in-up mb-10">
          <div className="relative flex h-[180px] w-[180px] items-center justify-center md:h-[220px] md:w-[220px]">
            {/* Outer glow rings */}
            <div className="animate-pulse-ring absolute left-1/2 top-1/2 h-[180px] w-[180px] rounded-full border border-white/15 md:h-[220px] md:w-[220px]" />
            <div className="animate-pulse-ring-delayed absolute left-1/2 top-1/2 h-[180px] w-[180px] rounded-full border border-white/10 md:h-[220px] md:w-[220px]" />

            {/* Orbit particles */}
            <div className="animate-orbit-1 absolute left-1/2 top-1/2 -ml-2 -mt-2">
              <div className="h-4 w-4 rounded-full bg-[#438b70] shadow-lg shadow-[#438b70]/50" />
            </div>
            <div className="animate-orbit-2 absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5">
              <div className="h-3 w-3 rounded-full bg-[#e6c200] shadow-lg shadow-[#e6c200]/50" />
            </div>
            <div className="animate-orbit-3 absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5">
              <div className="h-3 w-3 rounded-full bg-white shadow-lg shadow-white/30" />
            </div>
            <div className="animate-orbit-4 absolute left-1/2 top-1/2 -ml-2 -mt-2">
              <div className="h-4 w-4 rounded-full bg-[#456f9f] shadow-lg shadow-[#456f9f]/50" />
            </div>

            {/* Logo container */}
            <div className="relative z-10 flex h-[150px] w-[150px] items-center justify-center rounded-full border-2 border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm md:h-[180px] md:w-[180px]">
              <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-white/10 bg-white/5 md:h-[150px] md:w-[150px]">
                <Image
                  src="/logo.svg"
                  alt="DSC Logo"
                  width={90}
                  height={90}
                  className="object-contain md:h-[100px] md:w-[100px]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up delay-200 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
          {t(SITE_CONTENT.hero.headline, lang)}
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up delay-400 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg lg:text-xl">
          {t(SITE_CONTENT.hero.subheadline, lang)}
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up delay-600 mt-10">
          <Link href="/register">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-full px-10 py-6 text-base font-semibold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
            >
              <span className="relative z-10">
                {t(SITE_CONTENT.hero.cta, lang)}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#e6c200] to-[#c9a227] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 z-[4] h-32 w-full bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
