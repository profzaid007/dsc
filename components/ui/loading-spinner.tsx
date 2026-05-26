"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  inline?: boolean
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  inline = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        inline ? "inline-flex" : "flex",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}
