"use client"

import { useState } from "react"
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/lang-context"

interface DragItem {
  id: string
  order: number
}

interface DragListProps<T extends DragItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  containerClassName?: string
  disabled?: boolean
}

export function DragList<T extends DragItem>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  containerClassName,
  disabled = false,
}: DragListProps<T>) {
  const { lang } = useLang()
  const [dragged, setDragged] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  const drop = (id: string, target: string) => {
    if (disabled || id === target) return
    const from = sortedItems.findIndex(item => item.id === id)
    const to = sortedItems.findIndex(item => item.id === target)
    if (from < 0 || to < 0) return
    const result = [...sortedItems]
    const [item] = result.splice(from, 1)
    result.splice(to, 0, item)
    onReorder(result.map((item, order) => ({ ...item, order })))
  }

  const moveItem = (index: number, direction: "up" | "down") => {
      if (disabled) return
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
  }

  return (
    <div className={cn(containerClassName ?? "space-y-2")}>
      {sortedItems.map((item, index) => (
        <div
          key={keyExtractor(item)}
          data-drag-item={item.id}
          onDragOver={(event) => {
            if (disabled || !dragged) return
            event.preventDefault()
            event.dataTransfer.dropEffect = "move"
            setOver(item.id)
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (dragged) drop(dragged, item.id)
            setDragged(null)
            setOver(null)
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors",
            "hover:bg-muted/50",
            over === item.id && dragged !== item.id && "border-primary bg-primary/10",
            dragged === item.id && "opacity-50"
          )}
        >
          <button
            type="button"
            draggable={!disabled}
            disabled={disabled}
            aria-label={lang === "ar" ? "اسحب لتغيير الترتيب" : "Drag to reorder"}
            className="touch-none cursor-grab p-2 text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed"
            onPointerDown={(event) => {
              if (disabled || event.pointerType === "mouse") return
              event.currentTarget.setPointerCapture(event.pointerId)
              setDragged(item.id)
            }}
            onPointerMove={(event) => {
              if (disabled || event.pointerType === "mouse" || !dragged) return
              const row = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-drag-item]")
              setOver(row?.getAttribute("data-drag-item") || null)
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "mouse") return
              if (dragged && over) drop(dragged, over)
              setDragged(null); setOver(null)
            }}
            onPointerCancel={() => { setDragged(null); setOver(null) }}
            onDragStart={(event) => {
              if (disabled) { event.preventDefault(); return }
              event.dataTransfer.setData("text/plain", item.id)
              event.dataTransfer.effectAllowed = "move"
              setDragged(item.id)
            }}
            onDragEnd={() => { setDragged(null); setOver(null) }}
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5"
              disabled={disabled || index === 0}
              aria-label={lang === "ar" ? "تحريك لأعلى" : "Move up"}
              onClick={() => moveItem(index, "up")}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5"
              disabled={disabled || index === sortedItems.length - 1}
              aria-label={lang === "ar" ? "تحريك لأسفل" : "Move down"}
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
