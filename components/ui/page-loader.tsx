"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageLoaderProps {
  text?: string
  className?: string
  minHeight?: string
}

export function PageLoader({
  text = "Loading...",
  className,
  minHeight = "min-h-[400px]",
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        minHeight,
        className
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
