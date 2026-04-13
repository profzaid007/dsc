"use client"

import { use } from "react"
import SurveyBuilderPage from "../../new/page"

interface EditSurveyPageProps {
  params: Promise<{ id: string }>
}

export default function EditSurveyPage({ params }: EditSurveyPageProps) {
  return <SurveyBuilderPage params={params} />
}
