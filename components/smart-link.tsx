"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useLoading } from "@/components/loading-provider"
import { cn } from "@/lib/utils"

interface SmartLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  prefetch?: boolean
}

export function SmartLink({
  href,
  children,
  className,
  onClick,
  disabled,
  prefetch,
}: SmartLinkProps) {
  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      startLoading()
      onClick?.()
      // Stop loading after a short delay to simulate navigation complete
      // In Next.js App Router, we can't easily detect when a page finishes loading
      // So we use a timeout based approach
      const stop = () => stopLoading()
      window.addEventListener("popstate", stop, { once: true })
      setTimeout(stop, 800)
    },
    [startLoading, stopLoading, onClick, disabled]
  )

  if (disabled) {
    return (
      <span className={cn("pointer-events-none opacity-50", className)}>
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      prefetch={prefetch}
    >
      {children}
    </Link>
  )
}

// Also export a SmartButton that navigates and shows loading
interface SmartButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export function SmartButton({
  href,
  children,
  className,
  disabled,
}: SmartButtonProps) {
  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()

  const handleClick = useCallback(() => {
    if (disabled) return
    startLoading()
    router.push(href)
    setTimeout(() => stopLoading(), 800)
  }, [startLoading, stopLoading, router, href, disabled])

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}
