"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  clientAssignmentHref,
  clientAssignmentLabel,
  clientRoutes,
  type ClientRole,
} from "@/lib/client-services"
import { useLang } from "@/lib/lang-context"

import pb from "@/lib/pb"

type Notification = {
  id: string
  task: string
  session: string
  case: string
  name_en: string
  name_ar: string
  case_name: string
  change: "added" | "edited"
}

const notifications = pb.collection<Notification>("assignment_notifications")

export function ClientAssignmentNotifications({
  role,
  className,
}: {
  role: ClientRole
  className: string
}) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const label = ar ? "إشعارات التكليفات" : "Assignment notifications"
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<{
    items: Notification[]
    count: number
  }>()
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const count = snapshot?.count ?? 0

  const refresh = useCallback(async () => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    try {
      const result = await notifications.getList(1, 5, {
        filter: "read = false",
        sort: "-created,-id",
        fields: "id,task,session,case,name_en,name_ar,case_name,change",
        signal: request.signal,
        requestKey: null,
      })
      if (!request.signal.aborted) {
        setSnapshot({ items: result.items, count: result.totalItems })
        setError(false)
      }
    } catch {
      if (!request.signal.aborted) setError(true)
    }
  }, [])

  useEffect(() => {
    let active = true
    const subscriptions: (() => Promise<void>)[] = []
    const load = () => {
      if (active) void refresh()
    }

    function track(subscription: Promise<() => Promise<void>>) {
      return subscription.then((unsubscribe) => {
        if (active) subscriptions.push(unsubscribe)
        else void unsubscribe().catch(() => {})
      })
    }

    void Promise.all([
      track(notifications.subscribe("*", load)),
      track(pb.realtime.subscribe("PB_CONNECT", load)),
    ]).then(load, () => {
      if (active) setError(true)
    })
    window.addEventListener("focus", load)
    return () => {
      active = false
      controller.current?.abort()
      subscriptions.forEach((unsubscribe) => void unsubscribe().catch(() => {}))
      window.removeEventListener("focus", load)
    }
  }, [refresh])

  async function markAsRead(id: string, through = false) {
    if (saving) return
    setSaving(true)
    try {
      await pb.send("/api/dsc/assignment-notifications/read", {
        method: "POST",
        body: { id, through },
        requestKey: null,
      })
      await refresh()
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) void refresh()
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={className}
          title={label}
          aria-label={
            count
              ? ar
                ? `${label}، ${count} غير مقروءة`
                : `${label}, ${count} unread`
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
        dir={ar ? "rtl" : "ltr"}
        aria-label={label}
        className="max-w-[calc(100vw-1rem)]"
      >
        <h2 className="mb-2 font-semibold">{label}</h2>
        {!snapshot && !error && (
          <p role="status" className="text-sm">
            {ar ? "جارٍ تحميل التكليفات…" : "Loading assignments…"}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm">
            {ar
              ? "تعذر تحميل الإشعارات أو تحديثها."
              : "Notifications could not be loaded or updated."}
          </p>
        )}
        {snapshot && !count && (
          <p className="text-sm text-muted-foreground">
            {ar ? "لا توجد تكليفات غير مقروءة." : "No unread assignments."}
          </p>
        )}
        {snapshot?.items.map((item) => (
          <Link
            key={item.id}
            href={clientAssignmentHref(
              {
                id: item.session || item.task,
                kind: item.session ? "assessment" : "task",
                case: item.case,
              },
              role
            )}
            onClick={() => {
              void markAsRead(item.id)
              setOpen(false)
            }}
            className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
          >
            <span className="block font-medium break-words">
              {clientAssignmentLabel(item, ar)}
            </span>
            <span className="block text-xs break-words text-muted-foreground">
              {item.change === "added"
                ? ar
                  ? "تكليف جديد"
                  : "New assignment"
                : ar
                  ? "تم تعديل التكليف"
                  : "Assignment updated"}
              {" · "}
              {item.case_name}
            </span>
          </Link>
        ))}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={clientRoutes(role).assignments}
              onClick={() => setOpen(false)}
            >
              {ar ? "كل التكليفات" : "All assignments"}
            </Link>
          </Button>
          {snapshot?.items[0] && (
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => void markAsRead(snapshot.items[0].id, true)}
            >
              {ar ? "وضع علامة مقروء على الكل" : "Mark all as read"}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
