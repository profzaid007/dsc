import type { Metadata } from "next"
import { getPublicLecture } from "@/lib/public-events"
import { buildMetadata, metaDescription } from "@/lib/seo"

interface LectureDetailLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: LectureDetailLayoutProps): Promise<Metadata> {
  const { id } = await params

  const fallback = buildMetadata({
    title: "Public Lecture | DSC",
    description:
      "Join a DSC public lecture. View the agenda, speaker and registration details.",
    path: `/programmes/public_lectures/${id}`,
  })

  try {
    const lecture = await getPublicLecture(id)
    if (!lecture) return fallback
    return buildMetadata({
      title: `${lecture.title.en} | Public Lecture | DSC`,
      description: metaDescription(
        lecture.description.en,
        `${lecture.speaker.name.en} presents a DSC public lecture. View details and register online.`
      ),
      path: `/programmes/public_lectures/${id}`,
    })
  } catch {
    return fallback
  }
}

export default function LectureDetailLayout({
  children,
}: LectureDetailLayoutProps) {
  return children
}
