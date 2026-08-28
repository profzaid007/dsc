export interface CountryCode {
  value: string
  dialCode: string
  label: { en: string; ar: string }
}

export const COUNTRY_CODES: CountryCode[] = [
  { value: "sa", dialCode: "+966", label: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" } },
  { value: "ae", dialCode: "+971", label: { en: "UAE", ar: "الإمارات العربية المتحدة" } },
  { value: "kw", dialCode: "+965", label: { en: "Kuwait", ar: "الكويت" } },
  { value: "qa", dialCode: "+974", label: { en: "Qatar", ar: "قطر" } },
  { value: "bh", dialCode: "+973", label: { en: "Bahrain", ar: "البحرين" } },
  { value: "om", dialCode: "+968", label: { en: "Oman", ar: "عُمان" } },
  { value: "eg", dialCode: "+20", label: { en: "Egypt", ar: "مصر" } },
  { value: "jo", dialCode: "+962", label: { en: "Jordan", ar: "الأردن" } },
  { value: "lb", dialCode: "+961", label: { en: "Lebanon", ar: "لبنان" } },
  { value: "iq", dialCode: "+964", label: { en: "Iraq", ar: "العراق" } },
  { value: "sy", dialCode: "+963", label: { en: "Syria", ar: "سوريا" } },
  { value: "ye", dialCode: "+967", label: { en: "Yemen", ar: "اليمن" } },
  { value: "ps", dialCode: "+970", label: { en: "Palestine", ar: "فلسطين" } },
  { value: "tn", dialCode: "+216", label: { en: "Tunisia", ar: "تونس" } },
  { value: "dz", dialCode: "+213", label: { en: "Algeria", ar: "الجزائر" } },
  { value: "ma", dialCode: "+212", label: { en: "Morocco", ar: "المغرب" } },
  { value: "ly", dialCode: "+218", label: { en: "Libya", ar: "ليبيا" } },
  { value: "sd", dialCode: "+249", label: { en: "Sudan", ar: "السودان" } },
  { value: "tr", dialCode: "+90", label: { en: "Turkey", ar: "تركيا" } },
  { value: "in", dialCode: "+91", label: { en: "India", ar: "الهند" } },
  { value: "pk", dialCode: "+92", label: { en: "Pakistan", ar: "باكستان" } },
  { value: "bd", dialCode: "+880", label: { en: "Bangladesh", ar: "بنغلاديش" } },
  { value: "ph", dialCode: "+63", label: { en: "Philippines", ar: "الفلبين" } },
  { value: "us", dialCode: "+1", label: { en: "United States", ar: "الولايات المتحدة" } },
  { value: "gb", dialCode: "+44", label: { en: "United Kingdom", ar: "المملكة المتحدة" } },
  { value: "fr", dialCode: "+33", label: { en: "France", ar: "فرنسا" } },
  { value: "de", dialCode: "+49", label: { en: "Germany", ar: "ألمانيا" } },
  { value: "cn", dialCode: "+86", label: { en: "China", ar: "الصين" } },
]
