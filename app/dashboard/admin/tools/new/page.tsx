import { TemplateWorkspace } from "@/components/tools/TemplateWorkspace"
export default async function NewToolPage({ searchParams }: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const kind = type === "assessment" || type === "report" || type === "plan" || type === "survey" || type === "multiple_answer" ? type : undefined
  return <TemplateWorkspace initialKind={kind} lockKind={Boolean(kind)} />
}
