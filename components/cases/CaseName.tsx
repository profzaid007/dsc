"use client"

import type { Profile } from "@/types/profile"
import { useLang } from "@/lib/lang-context"

export function CaseName({ profile }: { profile: Pick<Profile, "name" | "owner_display"> }) {
  const { lang } = useLang()
  const owner = profile.owner_display
  return <><bdi>{profile.name}</bdi>{owner && <span className="ms-2 text-sm font-normal text-muted-foreground">(<span>{owner.type === "parent" ? (lang === "ar" ? "ولي الأمر" : "Parent") : (lang === "ar" ? "جهة الرعاية" : "Care foundation")}: </span><bdi>{owner.name || (lang === "ar" ? "الاسم مفقود؛ يلزم تصحيح السجل" : "Name missing; correct the record")}</bdi>)</span>}</>
}
