"use client"

import { useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import { usePermissions } from "@/hooks/usePermissions"
import { SmartLink } from "@/components/smart-link"
import { Button } from "@/components/ui/button"

interface Assignment {
  id: string
  case_id: string
  role_id?: string
  role?: string
  expand?: {
    case_id?: { name?: string }
    role_id?: { role_name_en?: string; role_name_ar?: string }
  }
}

export function UserAssignmentLinks({ userId }: { userId: string }) {
  const { lang } = useLang()
  const ar = lang === "ar"
  const access = usePermissions()
  const canReadCases = access.can("cases.read")
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{
    items: Assignment[]
    totalPages: number
  } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    pb.collection("case_experts")
      .getList<Assignment>(page, 10, {
        filter: pb.filter("expert_id = {:id}", { id: userId }),
        expand: "case_id,role_id",
        fields:
          "id,case_id,role_id,role,expand.case_id.name,expand.role_id.role_name_en,expand.role_id.role_name_ar",
        sort: "id",
        requestKey: null,
      })
      .then((data) => {
        if (active) setResult(data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, lang))
      })
    return () => {
      active = false
    }
  }, [userId, page, retry, lang])

  function changePage(next: number) {
    setResult(null)
    setError("")
    setPage(next)
  }

  return (
    <section
      aria-label={ar ? "الحالات المرتبطة بالخبير" : "Expert's linked cases"}
      className="space-y-3 text-sm"
    >
      <p className="font-medium">
        {ar ? "الحالات والأدوار المرتبطة" : "Linked cases and roles"}
      </p>
      {error ? (
        <div role="alert" className="space-y-2">
          <p>
            {ar
              ? "تعذر تحميل تفاصيل الإسنادات."
              : "Unable to load assignment details."}{" "}
            {error}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setError("")
              setResult(null)
              setRetry((value) => value + 1)
            }}
          >
            {ar ? "إعادة المحاولة" : "Retry"}
          </Button>
        </div>
      ) : !result ? (
        <p role="status">
          {ar ? "جارٍ تحميل الإسنادات..." : "Loading assignments..."}
        </p>
      ) : (
        <>
          {result.items.length === 0 && (
            <p>
              {ar
                ? "لا توجد إسنادات ظاهرة. ربما تغيرت السجلات أو لا تتوفر صلاحية عرضها."
                : "No assignments are visible. Records may have changed, or your access may be restricted."}
            </p>
          )}
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {result.items.map((assignment) => {
              const role = assignment.expand?.role_id
              const roleName =
                (ar ? role?.role_name_ar : role?.role_name_en) ||
                role?.role_name_en ||
                role?.role_name_ar ||
                assignment.role ||
                assignment.role_id
              const caseName =
                assignment.expand?.case_id?.name || assignment.case_id
              return (
                <li key={assignment.id} className="rounded-md border p-3">
                  {canReadCases && assignment.case_id ? (
                    <SmartLink
                      href={`/dashboard/admin/cases/${encodeURIComponent(assignment.case_id)}#case-allocations`}
                      className="font-medium text-primary underline"
                    >
                      {caseName}
                    </SmartLink>
                  ) : (
                    <p className="font-medium">{caseName}</p>
                  )}
                  <p className="text-muted-foreground">
                    {ar ? "رقم الحالة:" : "Case ID:"}{" "}
                    {assignment.case_id || "—"}
                  </p>
                  <p>
                    {ar ? "الدور:" : "Role:"}{" "}
                    {roleName || (ar ? "غير محدد" : "Not specified")}
                  </p>
                </li>
              )
            })}
          </ul>
          {result.totalPages > 1 && (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                {ar ? "السابق" : "Previous"}
              </Button>
              <span>
                {page} / {result.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= result.totalPages}
                onClick={() => changePage(page + 1)}
              >
                {ar ? "التالي" : "Next"}
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            {ar
              ? "راجع إسناد الخبير في صفحة الحالة قبل إزالة الإسناد أو تغييره."
              : "Review the expert allocation on the case page before removing or changing it."}
          </p>
        </>
      )}
    </section>
  )
}
