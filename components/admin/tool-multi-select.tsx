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
import type { Tool } from "@/types/tool"

interface ToolMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  tools: Tool[]
  lang?: string
  placeholder?: string
  emptyMessage?: string
}

export function ToolMultiSelect({
  value,
  onChange,
  tools,
  lang = "en",
  placeholder = "Select tools...",
  emptyMessage = "No tools found.",
}: ToolMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedTools = tools.filter((t) => value.includes(t.id))

  const toggleTool = (toolId: string) => {
    onChange(
      value.includes(toolId)
        ? value.filter((id) => id !== toolId)
        : [...value, toolId]
    )
  }

  const removeTool = (toolId: string) => {
    onChange(value.filter((id) => id !== toolId))
  }

  const getToolName = (tool: Tool) =>
    tool.name?.[lang as keyof typeof tool.name] || tool.name?.en || ""

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
            {selectedTools.length > 0 ? (
              selectedTools.map((tool) => (
                <Badge
                  key={tool.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {getToolName(tool)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTool(tool.id)
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
          <CommandInput placeholder="Search tools..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {tools.map((tool) => (
                <CommandItem
                  key={tool.id}
                  value={tool.id}
                  onSelect={() => toggleTool(tool.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(tool.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {getToolName(tool)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
