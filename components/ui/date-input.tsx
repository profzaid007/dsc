"use client"

import DatePicker from "react-datepicker"
import { ar } from "date-fns/locale/ar"
import { useLang } from "@/lib/lang-context"

import { Input } from "@/components/ui/input"
import { formatDate, parseISODate, toISODate } from "@/lib/format-date"
import { cn } from "@/lib/utils"

interface DateInputProps {
  value: string
  onChange?: (value: string) => void
  id?: string
  className?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** Earliest selectable date (inclusive). Accepts "YYYY-MM-DD" or a Date. */
  minDate?: string | Date
  /** Latest selectable date (inclusive). Accepts "YYYY-MM-DD" or a Date. */
  maxDate?: string | Date
}

function toPickerDate(value?: string | Date): Date | undefined {
  if (value === undefined || value === null) return undefined
  if (value instanceof Date) return value
  return parseISODate(value) ?? undefined
}

export function DateInput({
  value,
  onChange,
  id,
  className,
  placeholder = "dd-mm-yyyy",
  required,
  disabled,
  readOnly,
  minDate,
  maxDate,
}: DateInputProps) {
  const { lang } = useLang()
  const isArabic = lang === "ar"
  const inputPlaceholder = placeholder === "dd-mm-yyyy" && isArabic
    ? "يوم-شهر-سنة"
    : placeholder
  if (readOnly) {
    return (
      <Input
        fieldWidth="short"
        id={id}
        readOnly
        value={value ? formatDate(value) : ""}
        placeholder={inputPlaceholder}
        className={cn("cursor-default", className)}
      />
    )
  }

  return (
    <DatePicker
      id={id}
      locale={isArabic ? ar : undefined}
      previousMonthAriaLabel={isArabic ? "الشهر السابق" : "Previous month"}
      nextMonthAriaLabel={isArabic ? "الشهر التالي" : "Next month"}
      previousYearAriaLabel={isArabic ? "السنة السابقة" : "Previous year"}
      nextYearAriaLabel={isArabic ? "السنة التالية" : "Next year"}
      monthAriaLabelPrefix={isArabic ? "الشهر" : "Month"}
      chooseDayAriaLabelPrefix={isArabic ? "اختر" : "Choose"}
      disabledDayAriaLabelPrefix={isArabic ? "غير متاح" : "Not available"}
      required={required}
      disabled={disabled}
      selected={value ? parseISODate(value) : null}
      onChange={(d: Date | null) => onChange?.(d ? toISODate(d) : "")}
      dateFormat="dd-MM-yyyy"
      placeholderText={inputPlaceholder}
      showPopperArrow={false}
      showYearDropdown
      showMonthDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={120}
      minDate={toPickerDate(minDate)}
      maxDate={toPickerDate(maxDate)}
      customInput={<Input fieldWidth="short" className={cn("cursor-pointer", className)} />}
    />
  )
}
