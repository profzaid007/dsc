"use client"

import { cn } from "@/lib/utils"

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
          <SkeletonPulse className="h-5 w-3/4" />
          <SkeletonPulse className="h-4 w-1/2" />
          <SkeletonPulse className="h-20 w-full" />
          <div className="flex gap-2 pt-2">
            <SkeletonPulse className="h-8 w-20" />
            <SkeletonPulse className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-4 border-b p-4">
        <SkeletonPulse className="h-8 w-32" />
        <SkeletonPulse className="h-8 w-24" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <SkeletonPulse className="h-4 w-[250px]" />
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-4 w-16" />
            <div className="ms-auto flex gap-2">
              <SkeletonPulse className="h-8 w-8 rounded-full" />
              <SkeletonPulse className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
