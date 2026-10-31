"use client"

import { useEffect, useState } from "react"
import { DragList } from "@/components/ui/drag-list"
import { usePermissions } from "@/hooks/usePermissions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getTeamExperts } from "@/lib/team-experts"
import { saveExpertOrder } from "@/lib/expert-display-order"
import { getErrorMessage } from "@/lib/pb"
import { useLang } from "@/lib/lang-context"
import type { TeamExpert } from "@/types/team"
import { DataError } from "@/components/ui/data-error"
import { PageLoader } from "@/components/ui/page-loader"

export function ExpertDisplayOrder() {
  const { lang } = useLang()
  const access = usePermissions()
  const ar = lang === "ar"
  const [experts, setExperts] = useState<TeamExpert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    getTeamExperts({ all: true, throwOnError: true }).then((data) => {
      if (active) {
        setExperts(data)
        setLoading(false)
      }
    }).catch(error => { if (active) { setError(getErrorMessage(error, lang)); setLoading(false) } })
    return () => {
      active = false
    }
  }, [lang])
  async function save() {
    setSaving(true)
    try {
      await saveExpertOrder(experts.map((expert) => expert.id))
      setDirty(false)
      toast.success(ar ? "تم حفظ ترتيب الخبراء" : "Expert display order saved")
    } catch (error) {
      toast.error(getErrorMessage(error, lang))
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        {ar ? "ترتيب الخبراء في الصفحة الرئيسية" : "Landing page expert order"}
      </h2>
      <p className="text-muted-foreground">
        {ar
          ? "اسحب الخبراء النشطين وأفلتهم لتغيير الترتيب ثم احفظ. سيبدأ عرض الشرائح بالخبير الأول."
          : "Drag and drop active experts into order, then save. The carousel starts with the first expert."}
      </p>
      {error ? <DataError message={error} /> : loading ? (
        <PageLoader minHeight="min-h-24" />
      ) : experts.length === 0 ? (
        <p>{ar ? "لا يوجد خبراء نشطون" : "No active experts to display"}</p>
      ) : (
        <DragList
          items={experts.map((expert, order) => ({ ...expert, order }))}
          disabled={saving || !access.can("experts.update")}
          keyExtractor={expert => expert.id}
          onReorder={items => { setExperts(items); setDirty(true) }}
          renderItem={(expert, index) => (
            <div className="flex items-center gap-3">
              <span className="w-8 text-muted-foreground">{index + 1}</span>
              <span className="font-medium">{expert.name}</span>
            </div>
          )}
        />
      )}
      <Button disabled={loading || saving || !dirty || !access.can("experts.update")} onClick={save}>
        {saving
          ? ar
            ? "جارٍ الحفظ..."
            : "Saving..."
          : ar
            ? "حفظ الترتيب"
            : "Save order"}
      </Button>
    </section>
  )
}
