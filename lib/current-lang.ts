import type { Lang } from "@/types/form"

let currentLang: Lang = "en"

export function setCurrentLang(lang: Lang) {
  currentLang = lang
}

export function getCurrentLang(): Lang {
  return currentLang
}
