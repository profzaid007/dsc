"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";
import type { BilingualString, Lang } from "@/types/form";

interface ServiceCardProps {
  title: BilingualString;
  description: BilingualString;
  bullets: BilingualString[];
  lang: Lang;
}

function ServiceCard({ title, description, bullets, lang }: ServiceCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle
          className="text-xl font-bold"
          style={{ color: "var(--dsc-navy)" }}
        >
          {t(title, lang)}
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(description, lang)}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span
                className="mt-0.5 shrink-0 text-base leading-none"
                style={{ color: "var(--dsc-gold)" }}
              >
                ●
              </span>
              <span className="text-muted-foreground">{t(bullet, lang)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ServicesSection() {
  const { lang } = useLang();
  const { services } = SITE_CONTENT;

  return (
    <section id="services" className="scroll-mt-16 py-16 md:py-24" style={{ backgroundColor: "oklch(0.97 0 0)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="mb-10 border-s-4 ps-4 text-2xl font-bold md:text-3xl"
          style={{
            borderColor: "var(--dsc-gold)",
            color: "var(--dsc-navy)",
          }}
        >
          {t(services.sectionTitle, lang)}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ServiceCard
            title={services.individual.title}
            description={services.individual.description}
            bullets={services.individual.bullets}
            lang={lang}
          />
          <ServiceCard
            title={services.institutional.title}
            description={services.institutional.description}
            bullets={services.institutional.bullets}
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}
