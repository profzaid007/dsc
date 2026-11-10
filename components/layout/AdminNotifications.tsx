"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLang } from "@/lib/lang-context"
import pb from "@/lib/pb"

const sources = {
  cases: {
    collection: "cases",
    href: "/dashboard/admin/cases",
    en: "New cases",
    ar: "حالات جديدة",
  },
  experts: {
    collection: "users",
    href: "/dashboard/admin/experts",
    en: "New experts",
    ar: "خبراء جدد",
  },
} as const

type Source = keyof typeof sources
type Snapshot = {
  counts: Partial<Record<Source, number | null>>
  before: number
}

const day = 24 * 60 * 60 * 1000
const timestamp = (ms: number) => new Date(ms).toISOString().replace("T", " ")

export function AdminNotifications({
  userId,
  canReadCases,
  canReadExperts,
  className,
}: {
  userId: string
  canReadCases: boolean
  canReadExperts: boolean
  className: string
}) {
  const { lang } = useLang()
  const [snapshot, setSnapshot] = useState<Snapshot>()
  const [seenThrough, setSeenThrough] = useState<
    Partial<Record<Source, number>>
  >({})
  const [firstVisit] = useState(() => Date.now() - day)
  const [open, setOpen] = useState(false)
  const enabled = (source: Source) =>
    source === "cases" ? canReadCases : canReadExperts
  const visible = (Object.keys(sources) as Source[]).filter(enabled)
  const storagePrefix = `dsc:admin-notifications:${userId}:`
  const label = lang === "ar" ? "الإشعارات" : "Notifications"

  useEffect(() => {
    const controller = new AbortController()
    const activeSources: Source[] = []
    if (canReadCases) activeSources.push("cases")
    if (canReadExperts) activeSources.push("experts")
    let generation = 0

    async function refresh() {
      const request = ++generation
      const before = Date.now()
      const counts: Snapshot["counts"] = {}
      await Promise.all(
        activeSources.map(async (source) => {
          let since = seenThrough[source] ?? firstVisit
          try {
            const key = storagePrefix + source
            const saved = window.localStorage.getItem(key)
            const stored = Number(saved)
            if (
              saved &&
              Number.isSafeInteger(stored) &&
              stored > 0 &&
              stored <= before
            ) {
              since = Math.max(seenThrough[source] ?? 0, stored)
            } else {
              window.localStorage.setItem(key, String(since))
            }
          } catch {
            // Keep the session usable if browser storage is unavailable.
          }
          try {
            const { totalItems } = await pb
              .collection(sources[source].collection)
              .getList(1, 1, {
                fields: "id",
                filter: pb.filter(
                  "created >= {:since} && created < {:before}" +
                    (source === "experts" ? ' && role = "expert"' : ""),
                  { since: timestamp(since), before: timestamp(before) }
                ),
                requestKey: null,
                signal: controller.signal,
              })
            counts[source] = totalItems
          } catch {
            counts[source] = null
          }
        })
      )
      if (!controller.signal.aborted && request === generation) {
        setSnapshot({ counts, before })
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener("focus", refresh)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
    }
  }, [
    canReadCases,
    canReadExperts,
    firstVisit,
    open,
    seenThrough,
    storagePrefix,
  ])

  const count = visible.reduce(
    (total, source) => total + (snapshot?.counts[source] ?? 0),
    0
  )

  function markAsRead() {
    if (!snapshot) return
    const nextSeen = { ...seenThrough }
    const counts = { ...snapshot.counts }
    for (const source of visible) {
      if (!counts[source]) continue
      nextSeen[source] = snapshot.before
      counts[source] = 0
      try {
        const key = storagePrefix + source
        const saved = Number(window.localStorage.getItem(key))
        window.localStorage.setItem(
          key,
          String(Math.max(saved || 0, snapshot.before))
        )
      } catch {
        // The in-memory watermark still applies for this session.
      }
    }
    setSeenThrough(nextSeen)
    setSnapshot({ ...snapshot, counts })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className}
          title={label}
          aria-label={
            count
              ? lang === "ar"
                ? `الإشعارات، ${count} جديدة`
                : `Notifications, ${count} new`
              : label
          }
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute -end-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-slate-950"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        dir={lang === "ar" ? "rtl" : "ltr"}
        aria-label={label}
        className="max-w-[calc(100vw-1rem)]"
      >
        <h2 className="mb-2 font-semibold">{label}</h2>
        {visible.map((source) => {
          const item = sources[source]
          const total = snapshot?.counts[source]
          return (
            <Link
              key={source}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              <span>{item[lang]}</span>
              <span>
                {total ??
                  (total === null
                    ? lang === "ar"
                      ? "غير متاح"
                      : "Unavailable"
                    : "…")}
              </span>
            </Link>
          )
        })}
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={markAsRead}
          >
            {lang === "ar" ? "وضع علامة مقروء على الكل" : "Mark all as read"}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
