"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfileAvatar } from "@/components/profile/ProfileAvatar"

export const EMPTY_DASH = "—"

/** Reads a stored PocketBase value that may be a string or a number. */
export function fieldText(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

/** An empty value renders as a muted dash rather than collapsing the row. */
export function dash(value: string): string {
  return value.trim() ? value : EMPTY_DASH
}

export function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium break-words">{children}</div>
      </div>
    </div>
  )
}

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-5 py-5 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-5 sm:grid-cols-2">{children}</CardContent>
    </Card>
  )
}

export function TagList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-muted-foreground">{EMPTY_DASH}</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((item) => (
        <Badge key={item} variant="secondary" className="font-normal">
          {item}
        </Badge>
      ))}
    </div>
  )
}

export interface ProfileHeroBadge {
  key: string
  label: string
}

export interface ProfileHeroProps {
  name: string
  photoUrl?: string
  /** Rendered under the name, e.g. an email and a location. */
  meta?: React.ReactNode
  /** A single translucent pill, e.g. a degree and field of study. */
  chip?: string
  /** Gold pills, used for the field of service. */
  badges?: ProfileHeroBadge[]
  /** Muted line at the bottom, e.g. a creation date. */
  footer?: React.ReactNode
}

/**
 * Gradient banner shared by every profile view. Deliberately layout-only so
 * each role decides what appears in it.
 */
export function ProfileHero({
  name,
  photoUrl = "",
  meta,
  chip,
  badges,
  footer,
}: ProfileHeroProps) {
  const badgeList = badges ?? []

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 shadow-lg md:p-8"
      style={{ background: "var(--dsc-gradient)" }}
    >
      <div
        aria-hidden
        className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-black/10 blur-2xl"
      />
      <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:gap-7 md:text-start">
        <ProfileAvatar
          photoUrl={photoUrl}
          name={name}
          className="h-28 w-28 shrink-0 md:h-32 md:w-32"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold text-white md:text-3xl">{name}</h2>

          {meta && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-white/85 md:justify-start">
              {meta}
            </div>
          )}

          {chip && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                {chip}
              </span>
            </div>
          )}

          {badgeList.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
              {badgeList.map((badge) => (
                <span
                  key={badge.key}
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--dsc-gold)" }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {footer && <div className="mt-3">{footer}</div>}
        </div>
      </div>
    </div>
  )
}