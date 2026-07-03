"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { PORTALS, getPortalById, type Portal } from "@/lib/portals"

const OTHER_VALUE = "other"

function getPortalLabel(portal: Portal, lang: "en" | "ar"): string {
  if (lang === "ar") {
    return portal.portalName.ar.replace(/^بوابة /, "")
  }
  return portal.title
}

export interface PortalServiceValue {
  categoryId: string
  subCategoryId: string
  customCategory: string
  customSubCategory: string
}

interface PortalServiceSelectorProps {
  value?: PortalServiceValue
  onChange: (value: PortalServiceValue) => void
  required?: boolean
}

export function PortalServiceSelector({
  value = { categoryId: "", subCategoryId: "", customCategory: "", customSubCategory: "" },
  onChange,
  required = false,
}: PortalServiceSelectorProps) {
  const { lang } = useLang()

  const { categoryId, subCategoryId, customCategory, customSubCategory } = value

  const portal = getPortalById(categoryId)
  const services = portal?.services || []

  const isCustomCategory = categoryId === OTHER_VALUE
  const isCustomSubCategory = subCategoryId === OTHER_VALUE

  const handleCategoryChange = (newCategoryId: string) => {
    onChange({
      categoryId: newCategoryId,
      subCategoryId: "",
      customCategory: newCategoryId === OTHER_VALUE ? customCategory : "",
      customSubCategory: "",
    })
  }

  const handleSubCategoryChange = (newSubCategoryId: string) => {
    onChange({
      ...value,
      subCategoryId: newSubCategoryId,
      customSubCategory: newSubCategoryId === OTHER_VALUE ? customSubCategory : "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          {t({ en: "Issue Type", ar: "نوع المشكلة" }, lang)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={categoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue
              placeholder={t(
                { en: "Select issue type", ar: "اختر نوع المشكلة" },
                lang
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {PORTALS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {getPortalLabel(p, lang)}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_VALUE}>
              {t({ en: "Other", ar: "أخرى" }, lang)}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustomCategory && (
        <div className="space-y-2">
          <Label>
            {t(
              { en: "Custom issue type", ar: "اسم نوع المشكلة المخصص" },
              lang
            )}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={customCategory}
            onChange={(e) =>
              onChange({ ...value, customCategory: e.target.value })
            }
            placeholder={t(
              { en: "Enter issue type", ar: "أدخل اسم نوع المشكلة" },
              lang
            )}
          />
        </div>
      )}

      {categoryId && (
        <div className="space-y-2">
          <Label>
            {t({ en: "Case Type", ar: "نوع الحالة" }, lang)}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={subCategoryId} onValueChange={handleSubCategoryChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={t(
                  { en: "Select case type", ar: "اختر نوع الحالة" },
                  lang
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {t(s.name, lang)}
                </SelectItem>
              ))}
              <SelectItem value={OTHER_VALUE}>
                {t({ en: "Other", ar: "أخرى" }, lang)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isCustomSubCategory && (
        <div className="space-y-2">
          <Label>
            {t(
              { en: "Custom case type", ar: "اسم نوع الحالة المخصص" },
              lang
            )}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            value={customSubCategory}
            onChange={(e) =>
              onChange({ ...value, customSubCategory: e.target.value })
            }
            placeholder={t(
              { en: "Enter case type", ar: "أدخل اسم نوع الحالة" },
              lang
            )}
          />
        </div>
      )}
    </div>
  )
}
