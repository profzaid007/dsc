"use client";

import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";

export function AboutSection() {
  const { lang } = useLang();

  return (
    <section id="about" className="scroll-mt-16 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="mb-8 border-s-4 ps-4 text-2xl font-bold md:text-3xl"
          style={{
            borderColor: "var(--dsc-gold)",
            color: "var(--dsc-navy)",
          }}
        >
          {t(SITE_CONTENT.about.sectionTitle, lang)}
        </h2>

        <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>{t(SITE_CONTENT.about.paragraph1, lang)}</p>
          <p>{t(SITE_CONTENT.about.paragraph2, lang)}</p>
        </div>
      </div>
    </section>
  );
}
