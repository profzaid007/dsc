"use client"


import MultipleChoiceBuilderPage from "../../new/page"

interface EditMultipleChoicePageProps {
  params: Promise<{ id: string }>
}

export default function EditMultipleChoicePage({
  params,
}: EditMultipleChoicePageProps) {
  return <MultipleChoiceBuilderPage params={params} />
}
