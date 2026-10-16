import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Events & Programmes | DSC",
  description:
    "Browse all public events from Development Secrets Consultancy (DSC): public lectures, training programmes and workshops. View schedules and register online.",
  path: "/programmes",
})

export default function ProgrammesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
