"use client"

import { useLoading } from "@/components/loading-provider"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function NavigationProgress() {
  const { isLoading } = useLoading()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
      setProgress(0)
      // Animate to 70% quickly
      const t1 = setTimeout(() => setProgress(70), 100)
      return () => clearTimeout(t1)
    } else {
      // Complete to 100% then hide
      setProgress(100)
      const t2 = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
      return () => clearTimeout(t2)
    }
  }, [isLoading])

  if (!visible && !isLoading) return null

  return (
    <div
      className={cn(
        "sticky top-0 z-50 h-1 w-full bg-primary/20 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
