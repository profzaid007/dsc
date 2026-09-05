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
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { COUNTRY_CODES } from "@/lib/country-codes"
import { LANGUAGES } from "@/lib/language-list"
import { ChildFormBlock, type ChildFormData } from "./ChildFormBlock"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import pb, { authWithPassword, handlePocketBaseError } from "@/lib/pb"

const OTHER_VALUE = "other"

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function makeEmptyChild(): ChildFormData {
  return {
    id: generateId(),
    name: "",
    date_of_birth: "",
    gender: "",
    grade: "",
    portalService: {
      categoryId: "",
      subCategoryId: "",
      customCategory: "",
      customSubCategory: "",
    },
    notes: "",
  }
}

export function ParentRegistrationForm() {
  const { lang } = useLang()
  const router = useRouter()

  const [name, setName] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nationality, setNationality] = useState("")
  const [residence, setResidence] = useState("")
  const [relationshipToChildren, setRelationshipToChildren] = useState("")
  const [notes, setNotes] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [children, setChildren] = useState<ChildFormData[]>([makeEmptyChild()])

  const addChild = () => {
    setChildren((prev) => [...prev, makeEmptyChild()])
  }

  const removeChild = (id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id))
  }

  const updateChild = (id: string, data: ChildFormData) => {
    setChildren((prev) => prev.map((c) => (c.id === id ? data : c)))
  }

  const validate = (): boolean => {
    if (!name || !contactNumber || !email || !password) {
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
    for (const child of children) {
      if (!child.name || !child.date_of_birth || !child.gender) {
        setError(
          t(
            {
              en: "Please fill in all child information",
              ar: "يرجى ملء جميع معلومات الطفل",
            },
            lang
          )
        )
        return false
      }
      if (!child.portalService.categoryId || !child.portalService.subCategoryId) {
        setError(
          t(
            {
              en: "Please select a portal and service for each child",
              ar: "يرجى اختيار البوابة والخدمة لكل طفل",
            },
            lang
          )
        )
        return false
      }
      if (
        child.portalService.categoryId === OTHER_VALUE &&
        !child.portalService.customCategory.trim()
      ) {
        setError(
          t(
            {
              en: "Please enter a custom portal name for each child",
              ar: "يرجى إدخال اسم بوابة مخصصة لكل طفل",
            },
            lang
          )
        )
        return false
      }
      if (
        child.portalService.subCategoryId === OTHER_VALUE &&
        !child.portalService.customSubCategory.trim()
      ) {
        setError(
          t(
            {
              en: "Please enter a custom service name for each child",
              ar: "يرجى إدخال اسم خدمة مخصصة لكل طفل",
            },
            lang
          )
        )
        return false
      }
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
        email,
        password,
        passwordConfirm: password,
        name,
        contact_number: `${countryCode} ${contactNumber}`,
        role: "parent",
        is_active:true,
        emailVisibility: true,
      })

      const extra_data = await pb.collection("parent_profiles").create({ 
        user: user.id, 
        nationality: nationality, 
        country_of_residence: residence, 
        relationship_to_children: relationshipToChildren, 
        preferred_languages: preferredLanguages.join(", "),
        notes: notes,
      })

      for (const child of children) {
        await pb.collection("cases").create({
          user: user.id,
          name: child.name,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          grade: child.grade,
          category: child.portalService.categoryId,
          sub_category: child.portalService.subCategoryId,
          notes: child.notes,
          case_details: {
            custom_category:
              child.portalService.categoryId === OTHER_VALUE
                ? child.portalService.customCategory
                : undefined,
            custom_sub_category:
              child.portalService.subCategoryId === OTHER_VALUE
                ? child.portalService.customSubCategory
                : undefined,
          },
        })
      }

      await authWithPassword(email, password)
      // router.push("/dashboard")
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
            {t({ en: "Parent Information", ar: "معلومات ولي الأمر" }, lang)}
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
                {t({ en: "Mobile Number", ar: "رقم الجوال" }, lang)}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-30">
                    <SelectValue placeholder="+966" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60! max-w-30">
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

            <div className="space-y-2 md:col-span-2">
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
                {t({ en: "Relationship to Children", ar: "صلة القرابة بالأطفال" }, lang)}
              </Label>
              <Input
                value={relationshipToChildren}
                onChange={(e) => setRelationshipToChildren(e.target.value)}
                placeholder={t(
                  { en: "e.g. Father", ar: "مثال: أب" },
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {t({ en: "Children Information", ar: "معلومات الأطفال" }, lang)}
        </h3>
        {children.map((child, index) => (
          <ChildFormBlock
            key={child.id}
            index={index}
            data={child}
            onChange={(data) => updateChild(child.id, data)}
            onRemove={() => removeChild(child.id)}
            canRemove={children.length > 1}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addChild}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4 p-4" />
          {t({ en: "Add Another Child", ar: "إضافة طفل آخر" }, lang)}
        </Button>
      </div>

      <Button type="submit" className="p-4 w-full" disabled={isSubmitting}>
        {isSubmitting
          ? t({ en: "Registering...", ar: "جارٍ التسجيل..." }, lang)
          : t({ en: "Register", ar: "تسجيل" }, lang)}
      </Button>
    </form>
  )
}
