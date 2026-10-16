import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo"

export const metadata: Metadata = buildMetadata({
  title: "Training Programmes | DSC",
  description:
    "Explore DSC training programmes: professional development courses led by expert trainers. Find schedules, details and registration.",
  path: "/programmes/training_programmes",
})

export default function TrainingProgrammesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
