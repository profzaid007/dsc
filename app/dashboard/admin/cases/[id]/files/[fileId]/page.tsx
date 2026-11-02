import { CaseDocuments } from "@/components/cases/CaseDocuments"

export default async function CaseFilePage({ params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params
  return <div className="space-y-5"><CaseDocuments key={`${id}:${fileId}`} caseId={id} mode="detail" documentId={fileId} basePath={`/dashboard/admin/cases/${encodeURIComponent(id)}/files`} /></div>
}
