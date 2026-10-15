"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { buildCmsLayoutDocument, CMS_LAYOUT_SANDBOX } from "@/lib/cms-layout"

export function CustomLayoutFrame({
  html,
  lang,
  title,
}: {
  html: string
  lang: "ar" | "en"
  title?: string
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const observer = useRef<ResizeObserver | null>(null)
  const animation = useRef<number | null>(null)
  const [height, setHeight] = useState(640)
  const document = useMemo(
    () => buildCmsLayoutDocument(html, lang),
    [html, lang]
  )
  const onLoad = useCallback(() => {
    observer.current?.disconnect()
    const document = frame.current?.contentDocument
    const body = document?.body
    if (!document || !body) return
    const measure = () => {
      if (animation.current !== null) cancelAnimationFrame(animation.current)
      animation.current = requestAnimationFrame(() => {
        const nextHeight = Math.max(
          80,
          Math.ceil(
            Math.max(
              body.getBoundingClientRect().height,
              body.scrollHeight,
              document.documentElement.getBoundingClientRect().height
            )
          )
        )
        // A malformed viewport-based layout must not create an unbounded resize loop.
        setHeight((previous) =>
          Math.abs(previous - nextHeight) > 1
            ? Math.min(30000, nextHeight)
            : previous
        )
      })
    }
    measure()
    observer.current = new ResizeObserver(measure)
    observer.current.observe(body)
    observer.current.observe(document.documentElement)
  }, [])
  useEffect(
    () => () => {
      observer.current?.disconnect()
      if (animation.current !== null) cancelAnimationFrame(animation.current)
    },
    []
  )
  return (
    <iframe
      ref={frame}
      title={
        title ?? (lang === "ar" ? "معاينة تخطيط مخصص" : "Custom layout preview")
      }
      sandbox={CMS_LAYOUT_SANDBOX}
      referrerPolicy="no-referrer"
      srcDoc={document}
      onLoad={onLoad}
      className="block w-full border-0"
      style={{ height }}
    />
  )
}
