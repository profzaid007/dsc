"use client"

import DatePicker from "react-datepicker"

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
}: DateInputProps) {
  if (readOnly) {
    return (
      <Input
        id={id}
        readOnly
        value={value ? formatDate(value) : ""}
        placeholder={placeholder}
        className={cn("cursor-default", className)}
      />
    )
  }

  return (
    <DatePicker
      id={id}
      required={required}
      disabled={disabled}
      selected={value ? parseISODate(value) : null}
      onChange={(d: Date | null) => onChange?.(d ? toISODate(d) : "")}
      dateFormat="dd-MM-yyyy"
      placeholderText={placeholder}
      showPopperArrow={false}
      customInput={<Input className={cn("cursor-pointer", className)} />}
    />
  )
}
