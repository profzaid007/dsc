"use client"

import { useCallback, useEffect, useState } from "react"
import { useClassifications } from "@/hooks/useClassifications"
import { useLang } from "@/lib/lang-context"
import pb, { getErrorMessage } from "@/lib/pb"
import { boundedFullList } from "@/lib/bounded-records"
import { normalizeAllocationRole } from "@/lib/allocation-role-groups"
import type { RolesManagement } from "@/types/expert-role"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SpecialistSelector({ value, onChange, disabled = false }: {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const { lang } = useLang()
  const { groups: ALLOCATION_ROLE_GROUPS, isLoading: groupsLoading, error: groupsError, refresh: refreshGroups } = useClassifications()
  const ar = lang === "ar"
  const [roles, setRoles] = useState<RolesManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const refresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await boundedFullList<RolesManagement>(pb.collection("expert_roles_public"), { requestKey: null })
      setRoles(data.map(normalizeAllocationRole).sort((a, b) => (a.role_order || 0) - (b.role_order || 0)))
    } catch (err) {
      setError(`Public role catalog unavailable or requires correction. ${getErrorMessage(err)}`)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  const groupIds = new Set([...selectedGroups, ...roles.filter(role => value.includes(role.id)).map(role => role.role_group!)])
  const available = roles.filter(role => !role.is_retired || value.includes(role.id))
  const visibleRoles = available.filter(role => groupIds.has(role.role_group!) && `${role.role_name_en} ${role.role_name_ar}`.toLowerCase().includes(search.toLowerCase()))

  if (loading || groupsLoading) return <p role="status">{ar ? "جارٍ تحميل الأدوار..." : "Loading roles..."}</p>
  if (error || groupsError) return <div role="alert" className="space-y-2"><p>{error || groupsError}</p><Button type="button" variant="outline" onClick={() => { refreshGroups(); void refresh() }}>{ar ? "إعادة المحاولة" : "Retry"}</Button></div>
  const missingGroups = available.filter(role => !ALLOCATION_ROLE_GROUPS.some(group => group.id === role.role_group))
  if (missingGroups.length) return <div role="alert">{ar ? "يلزم تصحيح مجموعات الأدوار في قاعدة البيانات:" : "Role groups need correction in the database:"} {missingGroups.map(role => `${role.id}: ${role.role_group}`).join(", ")}</div>
  return <div className="dsc-form-grid" dir={ar ? "rtl" : "ltr"}>
    <fieldset disabled={disabled} className="space-y-3 rounded-lg border p-4">
      <legend className="px-2 font-semibold">{ar ? "مجموعة الأدوار" : "Role Group"}</legend>
      {ALLOCATION_ROLE_GROUPS.filter(group => available.some(role => role.role_group === group.id)).map(group => (
        <label key={group.id} className="flex items-center gap-2">
          <input type="checkbox" checked={groupIds.has(group.id)} onChange={() => {
            if (groupIds.has(group.id)) {
              setSelectedGroups(selectedGroups.filter(id => id !== group.id))
              onChange(value.filter(id => !roles.some(role => role.id === id && role.role_group === group.id)))
            } else setSelectedGroups([...selectedGroups, group.id])
          }} />
          {ar ? group.ar : group.en}
        </label>
      ))}
      {!available.length && <p className="text-sm text-muted-foreground">{ar ? "لا توجد أدوار متاحة حالياً." : "No roles are available yet."}</p>}
    </fieldset>
    <fieldset disabled={disabled} className="space-y-3 rounded-lg border p-4">
      <legend className="px-2 font-semibold">{ar ? "الدور (اختيار متعدد)" : "Role (multiple selection)"}</legend>
      <Input aria-label={ar ? "البحث في الأدوار" : "Search roles"} placeholder={ar ? "البحث في الأدوار..." : "Search roles..."} value={search} onChange={event => setSearch(event.target.value)} />
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {visibleRoles.map(role => <label key={role.id} className="flex items-center gap-2">
          <input type="checkbox" checked={value.includes(role.id)} onChange={() => onChange(value.includes(role.id) ? value.filter(id => id !== role.id) : [...value, role.id])} />
          {(ar ? role.role_name_ar : role.role_name_en) || role.role_name_en || role.role_name_ar}
        </label>)}
      </div>
      {!groupIds.size && <p className="text-sm text-muted-foreground">{ar ? "اختر مجموعة أولاً." : "Choose a role group first."}</p>}
      {!!groupIds.size && !visibleRoles.length && <p className="text-sm text-muted-foreground">{ar ? "لا توجد أدوار مطابقة." : "No matching roles."}</p>}
    </fieldset>
  </div>
}
