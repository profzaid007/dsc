"use client"

import { cn } from "@/lib/utils"

/** A soft shimmer block used to stand in for real content while loading. */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-md bg-muted/70", className)}
    >
      <span className="animate-shimmer-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Shimmer className="h-8 w-8 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <Shimmer className="h-2.5 w-24" />
        <Shimmer className="h-3.5 w-40" />
      </div>
    </div>
  )
}

function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card py-5 shadow-sm">
      <div className="flex items-center gap-3 px-6">
        <Shimmer className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="space-y-2">
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="h-2.5 w-44" />
        </div>
      </div>
      <div className="mx-6 mt-5 h-px bg-border" />
      <div className="mt-5 grid gap-5 px-6 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <RowSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function AboutSkeleton() {
  return (
    <div className="rounded-xl border bg-card py-5 shadow-sm">
      <div className="flex items-center gap-3 px-6">
        <Shimmer className="h-9 w-9 shrink-0 rounded-lg" />
        <Shimmer className="h-3.5 w-28" />
      </div>
      <div className="mt-5 space-y-2.5 px-6">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-11/12" />
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/**
 * Placeholder shaped like the profile views: gradient hero, badge row, then
 * section cards. Matching the real layout keeps the height stable when data
 * lands, so the page does not visibly jump.
 */
export function ProfileSkeleton({ expert = false }: { expert?: boolean }) {
  // Every view leads with an account section plus one or two role sections;
  // experts render three.
  const sectionCount = expert ? 3 : 2

  return (
    <div className="space-y-6" role="status" aria-busy="true">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg md:p-8">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{ background: "var(--dsc-gradient)" }}
        />
        <span aria-hidden className="absolute inset-0 overflow-hidden">
          <span className="animate-shimmer-sweep absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </span>
        <div className="relative flex flex-col items-center gap-5 md:flex-row md:gap-7">
          <Shimmer className="h-28 w-28 shrink-0 rounded-full border-4 border-white/40 md:h-32 md:w-32" />
          <div className="min-w-0 flex-1 space-y-3 text-center md:text-start">
            <Shimmer className="mx-auto h-7 w-52 md:mx-0" />
            <Shimmer className="mx-auto h-3.5 w-64 md:mx-0" />
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <Shimmer className="h-6 w-32 rounded-full" />
              <Shimmer className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Role and status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Shimmer className="h-5 w-24 rounded-full" />
        <Shimmer className="h-5 w-20 rounded-full" />
      </div>

      {Array.from({ length: sectionCount }).map((_, index) => (
        <SectionSkeleton key={index} />
      ))}

      <AboutSkeleton />

      <span className="sr-only">Loading profile</span>
    </div>
  )
}