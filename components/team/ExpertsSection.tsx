"use client";

import { User } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { Card, CardContent } from "@/components/ui/card";
import type { TeamExpert } from "@/types/team";
import { degreeLabel, specializationLabel } from "./team-labels";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

interface ExpertsSectionProps {
  experts: TeamExpert[];
}

export function ExpertsSection({ experts }: ExpertsSectionProps) {
  const { lang } = useLang();

  return (
    <section className="scroll-mt-16 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-sm font-bold uppercase tracking-widest"
            style={{ color: "var(--dsc-gold)" }}
          >
            {t({ en: "Our Team", ar: "فريقنا" }, lang)}
          </p>
          <h2
            className="text-2xl font-bold md:text-4xl"
            style={{ color: "var(--dsc-navy)" }}
          >
            {t({ en: "Meet the Experts", ar: "تعرف على الخبراء" }, lang)}
          </h2>
        </div>

        {experts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">
              {t(
                { en: "Our team of experts is being finalised. Please check back soon.", ar: "فريق الخبراء قيد الاستكمال. يرجى العودة لاحقاً." },
                lang
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <Card
                key={expert.id}
                className="group overflow-hidden p-0 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div
                  className="flex flex-col items-center px-6 pb-6 pt-10"
                  style={{
                    background:
                      "linear-gradient(180deg, #f4f7fb 0%, #ffffff 65%)",
                  }}
                >
                  <div className="relative">
                    <div
                      className="rounded-full p-[3px]"
                      style={{ background: "var(--dsc-gradient)" }}
                    >
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-[#eef2f7] shadow-md md:h-32 md:w-32">
                        {expert.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={expert.photoUrl}
                            alt={expert.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span
                              className="text-3xl font-bold md:text-4xl"
                              style={{ color: "var(--dsc-navy)" }}
                            >
                              {initials(expert.name) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className="mt-6 flex flex-col gap-2 p-0">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "var(--dsc-navy)" }}
                    >
                      {expert.name}
                    </h3>

                    {expert.degree && (
                      <span
                        className="mx-auto rounded-full px-3 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: "#eef2f7",
                          color: "var(--dsc-navy-light)",
                        }}
                      >
                        {degreeLabel(expert.degree, lang)}
                        {expert.fieldOfStudy
                          ? ` · ${expert.fieldOfStudy}`
                          : ""}
                      </span>
                    )}

                    {expert.roles.length > 0 && (
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                        {expert.roles.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--dsc-gold)",
                              color: "#fff",
                            }}
                          >
                            {specializationLabel(role, lang)}
                          </span>
                        ))}
                        {expert.roles.length > 2 && (
                          <span className="text-xs font-medium text-muted-foreground">
                            +{expert.roles.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {expert.bio && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                        {expert.bio}
                      </p>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}