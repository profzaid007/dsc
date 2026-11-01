"use client"

import { useEffect, useState } from "react"
import type { User } from "@/types/user"
import pb from "@/lib/pb"
import { personName } from "@/lib/person-name"

export function useUserDisplayName(user: User | null, lang: "ar" | "en") {
  const [profile, setProfile] = useState<{ userId: string; public_name_ar: string; public_name_en: string } | null>(null)
  const userId = user?.id
  const role = user?.role
  useEffect(() => {
    if (!userId || role !== "expert") return
    let active = true
    void pb.collection("expert_profiles").getFirstListItem(pb.filter("user = {:id}", { id: userId }), {
      fields: "public_name_ar,public_name_en", requestKey: null,
    }).then(record => {
      if (active) setProfile({ userId, public_name_ar: String(record.public_name_ar || ""), public_name_en: String(record.public_name_en || "") })
    }).catch(() => { /* Keep the account name if the profile is unavailable. */ })
    return () => { active = false }
  }, [userId, role, lang])
  return personName({ ...user, ...(profile?.userId === userId && role === "expert" ? profile : {}) }, lang)
}
