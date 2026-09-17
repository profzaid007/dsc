"use client";

import Image from "next/image";
import { Crown } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { FOUNDER } from "./TeamData";

export function FounderSection() {

  const { lang } = useLang();

  return (
    <section
      className="scroll-mt-16 overflow-hidden py-16 md:py-24"
      style={{
        background:
          "linear-gradient(180deg, #f4f7fb 0%, #ffffff 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          {/* Photo */}
          <div className="relative shrink-0">
            <div>
              <div
                className="rounded-full p-2"
                style={{
                  background: "var(--dsc-gradient)",
                  boxShadow: "0 20px 60px rgba(10, 61, 98, 0.25)",
                }}
              >
                <div className="rounded-full p-2 bg-white">
                  <div className="relative h-52 w-52 overflow-hidden rounded-full md:h-64 md:w-64">
                    <img
                      src={FOUNDER.photo}
                      alt={t(FOUNDER.name, lang)}
                      className="object-cover"
                      sizes="(max-width: 768px) 208px, 256px"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-lg"
              style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
            >
              <Crown className="h-4 w-4" />
              {t(FOUNDER.role, lang)}
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-start">
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "var(--dsc-gold)" }}
            >
              {t({ en: "Our Founder", ar: "مؤسسنا" }, lang)}
            </p>
            <h1
              className="text-3xl font-bold leading-tight md:text-5xl"
              style={{ color: "var(--dsc-navy)" }}
            >
              {t(FOUNDER.name, lang)}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {t(FOUNDER.bio, lang)}
            </p>
            <blockquote
              className="border-s-4 ps-4 text-base font-medium italic md:text-lg"
              style={{ borderColor: "var(--dsc-gold)", color: "var(--dsc-navy-light)" }}
            >
              &ldquo;{t(FOUNDER.quote, lang)}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
