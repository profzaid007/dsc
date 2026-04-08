"use client"

import { useState, useCallback } from "react"
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DragItem {
  id: string
  order: number
}

interface DragListProps<T extends DragItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function DragList<T extends DragItem>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
}: DragListProps<T>) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      const newItems = [...sortedItems]
      const targetIndex = direction === "up" ? index - 1 : index + 1

      if (targetIndex < 0 || targetIndex >= newItems.length) return

      const [movedItem] = newItems.splice(index, 1)
      newItems.splice(targetIndex, 0, movedItem)

      const reordered = newItems.map((item, idx) => ({
        ...item,
        order: idx,
      }))

      onReorder(reordered)
    },
    [sortedItems, onReorder]
  )

  return (
    <div className="space-y-2">
      {sortedItems.map((item, index) => (
        <div
          key={keyExtractor(item)}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors",
            "hover:bg-muted/50"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5"
              disabled={index === 0}
              onClick={() => moveItem(index, "up")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5"
              disabled={index === sortedItems.length - 1}
              onClick={() => moveItem(index, "down")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  )
}
