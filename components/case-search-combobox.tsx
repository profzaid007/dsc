"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { useState } from "react"
import { useProfiles } from "@/hooks/useProfiles"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface CaseSearchComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  readOnly?: boolean
  disabled?: boolean
  enabled?: boolean
}

export function CaseSearchCombobox({
  value,
  onChange,
  placeholder = "Select a case...",
  emptyMessage = "No cases found.",
  className,
  readOnly = false,
  disabled = false,
  enabled = true,
}: CaseSearchComboboxProps) {
  const ui = useUiTranslation()

  const [open, setOpen] = useState(false)
  const { profiles } = useProfiles(enabled)

  const selectedCase = profiles.find((p) => p.id === value)

  if (readOnly) return (
    <div className={cn("flex min-h-8 items-center rounded-lg border bg-muted/30 px-3 py-2 text-sm", className)} aria-live="polite">
      {selectedCase?.name || value || ui(placeholder)}
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !enabled}
          className={cn("w-full justify-between", className)}
        >
          {selectedCase ? selectedCase.name : ui(placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={ui("Search cases...")} />
          <CommandList>
            <CommandEmpty>{ui(emptyMessage)}</CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === profile.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{profile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {ui("Grade:")} {profile.grade}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
