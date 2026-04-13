"use client"

import { use } from "react"
import MediaBuilderPage from "../../new/page"

interface EditMediaPageProps {
  params: Promise<{ id: string }>
}

export default function EditMediaPage({ params }: EditMediaPageProps) {
  return <MediaBuilderPage params={params} />
}
