"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";

export function CTASection() {
  const { lang } = useLang();

  return (
    <section
      id="cta"
      className="scroll-mt-16 py-20"
      style={{ backgroundColor: "var(--dsc-navy)" }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          {t(SITE_CONTENT.cta.heading, lang)}
        </h2>
        <p
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed md:text-lg"
          style={{ color: "var(--dsc-gold)" }}
        >
          {t(SITE_CONTENT.cta.subtext, lang)}
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="px-10 py-6 text-base font-semibold shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
          >
            <Link href="/apply">{t(SITE_CONTENT.cta.button, lang)}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
