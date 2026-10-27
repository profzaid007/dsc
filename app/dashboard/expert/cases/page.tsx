"use client"
import { CaseName } from "@/components/cases/CaseName"
import Link from "next/link"
import { useProfiles } from "@/hooks/useProfiles"
import { useLang } from "@/lib/lang-context"
import { PageLoader } from "@/components/ui/page-loader"
import { DataError } from "@/components/ui/data-error"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
export default function ExpertCasesPage() {
  const { profiles, isLoading, loadError, refresh } = useProfiles()
  const { lang } = useLang()
  const ar = lang === "ar"
  if (isLoading) return <PageLoader />
  if (loadError) return <DataError message={loadError} onRetry={refresh} />
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {ar ? "الحالات المخصصة لي" : "My allocated cases"}
      </h1>
      {!profiles.length ? (
        <p className="text-muted-foreground">
          {ar ? "لا توجد حالات مسندة إليك بعد." : "No cases assigned yet."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="[overflow-wrap:anywhere]">
                  <CaseName profile={p} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/expert/cases/${p.id}`}>
                  <Button variant="outline">
                    {ar ? "عرض الحالة والتكليفات" : "View case and assignments"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
