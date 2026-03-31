"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";

export function HeroSection() {
  const { lang } = useLang();

  return (
    <section
      id="hero"
      className="scroll-mt-16 py-24 md:py-36"
      style={{ backgroundColor: "var(--dsc-navy)" }}
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1
          className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl"
        >
          {t(SITE_CONTENT.hero.headline, lang)}
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: "var(--dsc-gold)" }}
        >
          {t(SITE_CONTENT.hero.subheadline, lang)}
        </p>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-base font-semibold shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
          >
            <Link href="/apply">{t(SITE_CONTENT.hero.cta, lang)}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
