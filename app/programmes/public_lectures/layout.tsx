import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Public Lectures | DSC",
  description:
    "Browse upcoming and past DSC public lectures. Explore topics, speakers and dates, and register for free online sessions.",
  path: "/programmes/public_lectures",
})

export default function PublicLecturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
