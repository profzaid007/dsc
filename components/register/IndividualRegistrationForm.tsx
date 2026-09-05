"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
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
import pb, { authWithPassword, handlePocketBaseError } from "@/lib/pb"
import { prefetchDNS } from "react-dom"

const GENDERS = [
  { label: { en: "Male", ar: "ذكر" }, value: "male" },
  { label: { en: "Female", ar: "نث" }, value: "female" },
  { label: { en: "Other", ar: "آخر" }, value: "other" },
]

export function IndividualRegistrationForm() {

  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Extra fields 
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [nationality, setNationality] = useState("")
  const [residence, setResidence] = useState("")
  const [emContactName, setEmContactName] = useState("")
  const [emContactNumber, setEmContactNumber] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  // const [portalService, setPortalService] = useState<PortalServiceValue>({
  //   categoryId: "",
  //   subCategoryId: "",
  //   customCategory: "",
  //   customSubCategory: "",
  // })
  // const [notes, setNotes] = useState("")
  //
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = (): boolean => {
    if (!name || !contactNumber || !email || !password || !gender) {
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
        role: "individual",
        emailVisibility: true,
        is_active: true
      })

      const extra_data = await pb.collection("individual_profiles").create({ 
        user: user.id, 
        gender: gender, 
        date_of_birth: dateOfBirth,
        nationality: nationality, 
        country_of_residence: residence, 
        emergency_contact_name: emContactName, 
        emergency_contact_phone: emContactNumber, 
        preferred_languages: preferredLanguages.join(", "), 
        notes: notes,
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
            {t({ en: "Individual Registration", ar: "تسجيل فردي" }, lang)}
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
                  { en: "e.g. Ahmed Hassan", ar: "مثال: أحمد حسن" },
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
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="e.g. +966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-40">
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
            <div className="space-y-2">
              <Label>
                {t(
                  { en: "Gender", ar: "جنس" },
                  lang
                )}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-75">
                  <SelectValue placeholder={t({en: "e.g. Male", ar: "على سبيل المثا"}, lang)} />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-60!">
                  {GENDERS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t(c.label, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Date of Birth", ar: "تاريخ الميلاد" }, lang)}
              </Label>
              <DateInput
                value={dateOfBirth}
                onChange={setDateOfBirth}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {t({ en: "Nationality", ar: "الجنسية" }, lang)}
              </Label>
              <Input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder={t(
                  { en: "e.g. Saudi", ar: "مثال: سعودي" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Country of Residence", ar: "بلد الإقامة" }, lang)}
              </Label>
              <Input
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                placeholder={t(
                  { en: "e.g. Saudi Arabia", ar: "مثال: المملكة العربية السعودية" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Emergency Contact Name", ar: "اسم جهة الاتصال في الطوارئ" }, lang)}
              </Label>
              <Input
                value={emContactName}
                onChange={(e) => setEmContactName(e.target.value)}
                placeholder={t(
                  { en: "e.g. Fatima Al-Hassan", ar: "مثال: فاطمة الحسن" },
                  lang
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t({ en: "Emergency Contact Number", ar: "رقم جهة الاتصال في الطوارئ" }, lang)}
              </Label>
              <Input
                value={emContactNumber}
                onChange={(e) => setEmContactNumber(e.target.value)}
                placeholder={t(
                  { en: "e.g. 55 000 0000", ar: "مثال: 55 000 0000" },
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

          <div className="space-y-2">
            <Label>
              {t({ en: "Notes", ar: "ملاحظات" }, lang)}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t(
                {
                  en: "Add any additional notes...",
                  ar: "أضف أي ملاحظات إضافية...",
                },
                lang
              )}
              rows={3}
            />
          </div>

          <Button type="submit" className="mt-10 p-4 w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
              : t({ en: "Register", ar: "تسجيل" }, lang)}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
