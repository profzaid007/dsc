"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { COUNTRY_CODES } from "@/lib/country-codes"
import { LANGUAGES } from "@/lib/language-list"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "./PortalServiceSelector"
import pb, { authWithPassword, handlePocketBaseError } from "@/lib/pb"

const OTHER_VALUE = "other"

const ORGANIZATION_TYPES = [
  { label: { en: "School", ar: "مدرسة" }, value: "school" },
  { label: { en: "NGO", ar: "منظمة غير ربحية" }, value: "ngo" },
  { label: { en: "Corporate", ar: "شركة" }, value: "corporate" },
  { label: { en: "Government", ar: "جهة حكومية" }, value: "government" },
  { label: { en: "Clinic", ar: "عيادة" }, value: "clinic" },
  { label: { en: "Hospital", ar: "مستشفى" }, value: "hospital" },
  { label: { en: "Other", ar: "أخرى" }, value: "other" },
]

export function OrganizationRegistrationForm() {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [representativeName, setRepresentativeName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [portalService, setPortalService] = useState<PortalServiceValue>({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })
  const [notes, setNotes] = useState("")
  const [organizationType, setOrganizationType] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [website, setWebsite] = useState("")
  const [representativeNumber, setRepresentativeNumber] = useState("")
  const [representativeTitle, setRepresentativeTitle] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = (): boolean => {
    if (!organizationName || !name || !contactNumber || !email || !password) {
      setError(
        t(
          {
            en: "Please fill in all required fields",
            ar: "يرجى ملء جميع الحقول المطلوبة",
          },
          lang
        )
      )
      return false
    }
    if (password !== confirmPassword) {
      setError(
        t(
          { en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" },
          lang
        )
      )
      return false
    }
    if (!portalService.categoryId || !portalService.subCategoryId) {
      setError(
        t(
          {
            en: "Please select a portal and service",
            ar: "يرجى اختيار البوابة والخدمة",
          },
          lang
        )
      )
      return false
    }
    if (
      portalService.categoryId === OTHER_VALUE &&
      !portalService.customCategory.trim()
    ) {
      setError(
        t(
          {
            en: "Please enter a custom portal name",
            ar: "يرجى إدخال اسم بوابة مخصصة",
          },
          lang
        )
      )
      return false
    }
    if (
      portalService.subCategoryId === OTHER_VALUE &&
      !portalService.customSubCategory.trim()
    ) {
      setError(
        t(
          {
            en: "Please enter a custom service name",
            ar: "يرجى إدخال اسم خدمة مخصصة",
          },
          lang
        )
      )
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const user = await pb.collection("users").create({
        email: email.toLowerCase(),
        password,
        passwordConfirm: password,
        name,
        contact_number: `${countryCode} ${contactNumber}`,
        role: "organization",
        is_active:true,
        emailVisibility: true,
      })

      const extra_data = await pb.collection("organization_profiles").create({ 
        user: user.id, 
        organization_name: organizationName, 
        organization_type: organizationType, 
        country: country, 
        city: city, 
        website: website, 
        responsible_person_name: representativeName, 
        responsible_person_title: representativeTitle, 
        responsible_person_phone: representativeNumber, 
        preferred_languages: preferredLanguages.join(", "),
        notes: notes
      })

      await pb.collection("cases").create({
        user: user.id,
        name: organizationName,
        category: portalService.categoryId,
        sub_category: portalService.subCategoryId,
        notes,
        case_details: {
          custom_category:
            portalService.categoryId === OTHER_VALUE
              ? portalService.customCategory
              : undefined,
          custom_sub_category:
            portalService.subCategoryId === OTHER_VALUE
              ? portalService.customSubCategory
              : undefined,
        },
      })

      await authWithPassword(email.toLowerCase(), password)
      router.push("/dashboard")
    } catch (err) {
      setError(handlePocketBaseError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t({ en: "Organization Registration", ar: "تسجيل مؤسسة" }, lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Name", ar: "الاسم" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(
                  { en: "e.g. Mohammed Al-Rashid", ar: "مثال: محمد الراشد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Organization Name", ar: "اسم المؤسسة" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t(
                  { en: "e.g. ABC Company", ar: "مثال: شركة أبجد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="+966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-30!">
                    {COUNTRY_CODES.map((c) => (
                      <SelectItem key={c.value} value={c.dialCode}>
                        {t(c.label, lang)} ({c.dialCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder={t(
                    { en: "e.g. 50 000 0000", ar: "مثال: 50 000 0000" },
                    lang
                  )}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Email", ar: "البريد الإلكتروني" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Password", ar: "كلمة المرور" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t(
                  { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
                  lang
                )}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Organization Type", ar: "نوع المؤسسة" }, lang)}
              </Label>
              <Select value={organizationType} onValueChange={setOrganizationType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t({ en: "Select type...", ar: "اختر النوع..." }, lang)} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {ORGANIZATION_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Country", ar: "الدولة" }, lang)}
              </Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t(
                  { en: "e.g. Saudi Arabia", ar: "مثال: المملكة العربية السعودية" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "City", ar: "المدينة" }, lang)}
              </Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t(
                  { en: "e.g. Riyadh", ar: "مثال: الرياض" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Website", ar: "الموقع الإلكتروني" }, lang)}
              </Label>
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Name", ar: "اسم الممثل" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                placeholder={t(
                  { en: "e.g. Mohammed Al-Rashid", ar: "مثال: محمد الراشد" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Number", ar: "رقم الممثل" }, lang)}
              </Label>
              <Input
                value={representativeNumber}
                onChange={(e) => setRepresentativeNumber(e.target.value)}
                placeholder={t(
                  { en: "e.g. 55 000 0000", ar: "مثال: 55 000 0000" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Representative Title", ar: "المسمى الوظيفي للممثل" }, lang)}
              </Label>
              <Input
                value={representativeTitle}
                onChange={(e) => setRepresentativeTitle(e.target.value)}
                placeholder={t(
                  { en: "e.g. HR Manager", ar: "مثال: مدير الموارد البشرية" },
                  lang
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t({ en: "Preferred Languages", ar: "اللغات المفضلة" }, lang)}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {preferredLanguages.length > 0 ? (
                      preferredLanguages.map((langValue) => {
                        const langOption = LANGUAGES.find((l) => l.value === langValue)
                        return (
                          <Badge
                            key={langValue}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {langOption ? t(langOption.label, lang) : langValue}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreferredLanguages(
                                  preferredLanguages.filter((l) => l !== langValue)
                                )
                              }}
                            />
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {t(
                          { en: "Select languages...", ar: "اختر اللغات..." },
                          lang
                        )}
                      </span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder={t({ en: "Search languages...", ar: "البحث عن اللغات..." }, lang)} />
                  <CommandList>
                    <CommandEmpty>
                      {t({ en: "No language found.", ar: "لم يتم العثور على لغة." }, lang)}
                    </CommandEmpty>
                    <CommandGroup>
                      {LANGUAGES.map((langOption) => (
                        <CommandItem
                          key={langOption.value}
                          value={langOption.value}
                          onSelect={() => {
                            setPreferredLanguages(
                              preferredLanguages.includes(langOption.value)
                                ? preferredLanguages.filter((l) => l !== langOption.value)
                                : [...preferredLanguages, langOption.value]
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              preferredLanguages.includes(langOption.value)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {t(langOption.label, lang)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <PortalServiceSelector
            value={portalService}
            onChange={setPortalService}
            required
          />

          <div className="space-y-2">
            <Label>
              {t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                {
                  en: "Add any additional notes about this case...",
                  ar: "أضف أي ملاحظات إضافية حول هذه الحالة...",
                },
                lang
              )}
              rows={3}
            />
          </div>

          <Button type="submit" className="p-4 w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
              : t({ en: "Register", ar: "تسجيل" }, lang)}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
