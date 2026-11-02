import { CaseDocuments } from "@/components/cases/CaseDocuments"

export default async function CaseFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div className="space-y-5"><CaseDocuments key={id} caseId={id} mode="list" basePath={`/dashboard/admin/cases/${encodeURIComponent(id)}/files`} /></div>
}
