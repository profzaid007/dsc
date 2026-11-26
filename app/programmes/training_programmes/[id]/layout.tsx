import type { Metadata } from "next"
import { getPublicProgram } from "@/lib/public-events"
import { buildMetadata, metaDescription } from "@/lib/seo"

interface TrainingDetailLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: TrainingDetailLayoutProps): Promise<Metadata> {
  const { id } = await params

  const fallback = buildMetadata({
    title: "Training Programme | DSC",
    description:
      "Join a DSC training programme. View the schedule, curriculum and registration details.",
    path: `/programmes/training_programmes/${id}`,
  })

  try {
    const program = await getPublicProgram(id)
    if (!program) return fallback
    return buildMetadata({
      title: `${program.title.en} | Training Programme | DSC`,
      description: metaDescription(
        program.goals?.en,
        `${program.category.en} training programme from DSC. View the schedule and register online.`
      ),
      path: `/programmes/training_programmes/${id}`,
    })
  } catch {
    return fallback
  }
}

export default function TrainingDetailLayout({
  children,
}: TrainingDetailLayoutProps) {
  return children
}
