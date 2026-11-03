"use client"

import { useEffect, useState } from "react"

/** Keep browser-owned file URLs out of render and release them when files change. */
export function useFilePreviewUrls(files: ReadonlyMap<string, File>) {
  const [previews, setPreviews] = useState(new Map<string, { file: File; url: string }>())
  useEffect(() => {
    const next = new Map<string, { file: File; url: string }>()
    for (const [id, file] of files) next.set(id, { file, url: URL.createObjectURL(file) })
    setPreviews(next)
    return () => { for (const { url } of next.values()) URL.revokeObjectURL(url) }
  }, [files])
  return new Map([...previews].flatMap(([id, preview]) =>
    files.get(id) === preview.file ? [[id, preview.url] as const] : []
  ))
}
