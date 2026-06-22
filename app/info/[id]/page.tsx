import { sanitizeCmsContent } from "@/lib/sanitize"

import Link from "next/link"
import { notFound } from "next/navigation"
import pb from "@/lib/pb"
import { getPortalById } from "@/lib/portals"
import type { InfoPage } from "@/types/cms"
import "suneditor/css/contents"

interface InfoPageProps {
  params: Promise<{ id: string }>
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { id } = await params

  let page: InfoPage | null = null

  try {
    const record = await pb
      .collection("info_pages")
      .getFirstListItem(`slug = "${id}" && is_published = true`)
    page = record as unknown as InfoPage
  } catch {
    // Record not found or not published
  }

  // Find which portal/service this id belongs to for display purposes
  let serviceName = id.replace(/-/g, " ")
  let portal = null
  for (const p of [1, 2, 3, 4, 5]) {
    const foundPortal = getPortalById(String(p))
    const foundService = foundPortal?.services.find((s) => s.id === id)
    if (foundService) {
      portal = foundPortal
      serviceName = foundService.name.en
      break
    }
  }

  // If page exists and is published → render it
  if (page) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Back
        </Link>
        <h1 className="mb-8 text-3xl font-bold capitalize">
          {page.title || serviceName}
        </h1>
        <div
          className="cms-rendered sun-editor-editable space-y-4 text-gray-700 leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: sanitizeCmsContent(page.content_en) }}
        />
      </div>
    )
  }

  // If not published → show coming soon
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        &larr; Back
      </Link>
      <h1 className="mb-4 text-3xl font-bold capitalize">{serviceName}</h1>
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg text-muted-foreground">Coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is being prepared. Check back later.
        </p>
      </div>
    </div>
  )
}
