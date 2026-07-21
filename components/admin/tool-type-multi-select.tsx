"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import type { ToolTypeRecord } from "@/lib/tool-types"

interface ToolTypeMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  toolTypes: ToolTypeRecord[]
  lang?: string
  placeholder?: string
  emptyMessage?: string
}

export function ToolTypeMultiSelect({
  value,
  onChange,
  toolTypes,
  lang = "en",
  placeholder = "Select tool types...",
  emptyMessage = "No tool types found.",
}: ToolTypeMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedToolTypes = toolTypes.filter((t) => value.includes(t.id))

  const toggleToolType = (toolTypeId: string) => {
    onChange(
      value.includes(toolTypeId)
        ? value.filter((id) => id !== toolTypeId)
        : [...value, toolTypeId]
    )
  }

  const removeToolType = (toolTypeId: string) => {
    onChange(value.filter((id) => id !== toolTypeId))
  }

  const getToolTypeName = (toolType: ToolTypeRecord) =>
    toolType.label?.[lang as keyof typeof toolType.label] ||
    toolType.label?.en ||
    toolType.key ||
    toolType.name ||
    ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selectedToolTypes.length > 0 ? (
              selectedToolTypes.map((toolType) => (
                <Badge
                  key={toolType.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {getToolTypeName(toolType)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeToolType(toolType.id)
                    }}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tool types..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {toolTypes.map((toolType) => (
                <CommandItem
                  key={toolType.id}
                  value={toolType.id}
                  onSelect={() => toggleToolType(toolType.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(toolType.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getToolTypeName(toolType)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
