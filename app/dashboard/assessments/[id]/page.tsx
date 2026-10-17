"use client"
import { useParams } from "next/navigation"
import ClientAssessments from "@/components/assessments/ClientAssessments"
export default function MyAssessmentPage() {
  const { id } = useParams<{ id: string }>()
  return <ClientAssessments sessionId={id} />
}
