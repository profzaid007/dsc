"use client"
import { useClassifications } from "@/hooks/useClassifications"
import { usePermissions } from "@/hooks/usePermissions"

import { allocationRowsForSave } from "@/lib/allocation-role-groups"
import { boundedFullList } from "@/lib/bounded-records"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataError } from "@/components/ui/data-error"
import { useAllocations } from "@/hooks/useAllocations"
import { useUsers } from "@/hooks/useUsers"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Save,
  UserCheck,
  Users,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { toast } from "sonner"
import pb, { getErrorMessage } from "@/lib/pb"
import { allocationExpertDirectory, filterAllocationExperts } from "@/lib/allocation-expert-search"
import { ExpertSearchResults } from "./ExpertSearchResults"
import type { ExpertProfile } from "@/types/expert"
import type { RolesManagement } from "@/types/expert-role"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useRolesManagement } from "@/hooks/useRolesManagement"
import { Input } from "@/components/ui/input"

interface AllocationRow {
  id?: string
  expert_id: string
  /** Matches `role_name_en` of a roles_management record */
  role: string
  role_group?: string
}

function ExpertCombobox({
  value,
  onChange,
  experts,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  experts: Array<{ id: string; name: string; email: string }>
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const { lang } = useLang()
  const selectedExpert = experts.find((e) => e.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedExpert
            ? selectedExpert.name
            : placeholder ||
              (lang === "ar" ? "اختر خبير..." : "Select expert...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={
              lang === "ar" ? "تصفية الخبراء..." : "Search experts..."
            }
          />
          <CommandList>
            <CommandEmpty>
              {lang === "ar" ? "لم يتم العثور على خبراء." : "No experts found."}
            </CommandEmpty>
            <CommandGroup>
              {experts.map((expert) => (
                <CommandItem
                  key={expert.id}
                  value={expert.id + " " + expert.name + " " + expert.email}
                  onSelect={() => {
                    onChange(expert.id === value ? "" : expert.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === expert.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{expert.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {expert.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function CaseAllocations({
  caseId,
  onSaved,
}: {
  caseId: string
  onSaved?: () => void
}) {
  const selectedCase = caseId
  const { groups: ALLOCATION_ROLE_GROUPS } = useClassifications()

  const access = usePermissions()
  const canReadExperts = access.can("experts.read")
  const { lang } = useLang()
  const { users, isLoading: isUsersLoading } = useUsers(
    access.can("experts.read") || access.can("users.read")
  )
  const {
    allocations,
    loadError: allocationsError,
    isLoading: isAllocationsLoading,
    refresh: refreshAllocations,
  } = useAllocations(caseId)

  const [expertProfiles, setExpertProfiles] = useState<ExpertProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("")
  useEffect(() => {
    if (!canReadExperts) return
    boundedFullList(pb.collection("expert_profiles"))
      .then((data) => { setExpertProfiles(data as unknown as ExpertProfile[]); setProfilesError("") })
      .catch((error) => { setProfilesError(getErrorMessage(error, lang)); setExpertProfiles([]) })
      .finally(() => setProfilesLoading(false))
  }, [canReadExperts, lang])
  const [rows, setRows] = useState<AllocationRow[]>([])
  const [originalRows, setOriginalRows] = useState<AllocationRow[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const { roles: roleMgmtRoles, isLoading: isRolesLoading } = useRolesManagement()
  const getRoleLabel = (role: RolesManagement) =>
    (lang === "ar" ? role.role_name_ar : role.role_name_en) ||
    (lang === "ar" ? role.role_name_en : role.role_name_ar) || ""

  const allExperts = useMemo(() => allocationExpertDirectory(users, expertProfiles, roleMgmtRoles, lang), [users, expertProfiles, roleMgmtRoles, lang])
  const experts = useMemo(() => filterAllocationExperts(allExperts, {
    name: nameFilter, country: countryFilter, city: cityFilter, specialty: specialtyFilter,
  }), [allExperts, nameFilter, countryFilter, cityFilter, specialtyFilter])
  const hasSearch = Boolean(nameFilter.trim() || countryFilter.trim() || cityFilter.trim() || specialtyFilter.trim())
  function selectSearchExpert(id: string) {
    setRows(previous => {
      if (previous.some(row => row.expert_id === id)) return previous
      const empty = previous.findIndex(row => !row.expert_id && !row.role)
      return empty < 0 ? [...previous, { expert_id: id, role: "", role_group: "" }] : previous.map((row, index) => index === empty ? { ...row, expert_id: id } : row)
    })
  }

  // Load existing allocations when case is selected
  const loadAllocationsForCase = useCallback(
    (caseId: string) => {
      const caseAllocations = allocations.filter((a) => a.case_id === caseId)
      const loadedRows: AllocationRow[] = caseAllocations.map((a) => ({
        id: a.id,
        expert_id: a.expert_id,
        role: a.expand?.role_id?.role_name_en || "",
      }))
      setRows(loadedRows)
      setOriginalRows(loadedRows)
    },
    [allocations]
  )

  useEffect(() => {
    if (selectedCase) {
      // Synchronize rows when the selected case or its saved allocations change.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAllocationsForCase(selectedCase)
    } else {
      setRows([])
      setOriginalRows([])
    }
  }, [selectedCase, loadAllocationsForCase])

  const addRow = () => {
    setRows((prev) => [...prev, { expert_id: "", role: "", role_group: "" }])
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, updates: Partial<AllocationRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...updates } : row))
    )
  }

  const handleSave = async () => {
    if (!selectedCase) return

    // Validate rows
    const invalidRows = rows.filter((r) => !r.expert_id || !r.role)
    if (invalidRows.length > 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار خبير ودور لكل صف."
          : "Please select an expert and role for each row."
      )
      return
    }

    setIsSaving(true)
    try {
      await pb.send(`/api/dsc/cases/${selectedCase}/allocations`, {
        method: "POST",
        body: { rows: allocationRowsForSave(rows, roleMgmtRoles) },
      })
      toast.success(lang === "ar" ? "تم حفظ تخصيص الخبراء." : "Expert allocations saved.")
      await refreshAllocations()
      onSaved?.()
    } catch (error) {
      console.error("Failed to save allocations:", error)
      toast.error(
        lang === "ar"
          ? "فشل حفظ التخصيصات. يرجى المحاولة مرة أخرى."
          : "Failed to save allocations. Please try again.",
        { description: getErrorMessage(error) }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading =
    isUsersLoading ||
    isAllocationsLoading ||
    isRolesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary">
                {lang === "ar" ? "نموذج التخصيص" : "Allocation Form"}
              </h2>
              <p className="text-muted-foreground">
                {lang === "ar"
                  ? "تخصيص الخبراء لهذه الحالة"
                  : "Allocate experts to this case"}
              </p>
            </div>
          </div>
        </div>
        <SkeletonTable rows={4} />
      </div>
    )
  }

  const hasChanges = JSON.stringify(rows) !== JSON.stringify(originalRows)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {lang === "ar" ? "نموذج التخصيص" : "Allocation Form"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "تخصيص الخبراء لهذه الحالة"
                : "Allocate experts to this case"}
            </p>
          </div>
        </div>
      </div>

      {allocationsError && (
        <DataError message={allocationsError} onRetry={refreshAllocations} />
      )}
      {(!access.can("cases.read") || !canReadExperts) && (
        <p
          role="status"
          className="rounded-lg border bg-white p-4 text-sm text-muted-foreground"
        >
          {lang === "ar"
            ? "اختيار الحالات والخبراء يتطلب صلاحية قراءة الحالات والخبراء. تواصل مع المشرف العام لتحديث وصولك."
            : "Selecting cases and experts requires Cases and Experts read access. Contact your Super Admin to update your access."}
        </p>
      )}
      <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Input
              aria-label={lang === "ar" ? "اسم الخبير" : "Expert name"}
              placeholder={lang === "ar" ? "التصفية حسب اسم الخبير" : "Filter by expert name"}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <Input
              aria-label={
                lang === "ar" ? "بلد الإقامة" : "Country of Residence"
              }
              placeholder={
                lang === "ar"
                  ? "التصفية حسب بلد الإقامة"
                  : "Filter by country of residence"
              }
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            />
            <Input
              aria-label={lang === "ar" ? "مدينة الإقامة" : "City of Residence"}
              placeholder={
                lang === "ar"
                  ? "التصفية حسب مدينة الإقامة"
                  : "Filter by city of residence"
              }
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <Input
              aria-label={lang === "ar" ? "التخصص" : "Specialization"}
              placeholder={
                lang === "ar" ? "التصفية حسب التخصص" : "Filter by specialization"
              }
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            />
          </div>
          {hasSearch && canReadExperts && <ExpertSearchResults experts={experts} lang={lang} loading={profilesLoading} error={profilesError} selectedIds={rows.map(row => row.expert_id)} disabled={isSaving || !selectedCase || !access.can("allocations.create")} onSelect={selectSearchExpert} onClear={() => {
            setNameFilter("")
            setCountryFilter("")
            setCityFilter("")
            setSpecialtyFilter("")
          }} />}
          {!hasSearch && <p className="text-sm text-muted-foreground">{lang === "ar" ? "اكتب الاسم أو البلد أو المدينة أو التخصص لعرض الخبراء المطابقين، أو اضغط إضافة خبير لعرض القائمة." : "Enter a name, country, city, or specialization to see matching experts, or click Add Expert to browse."}</p>}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={
                !selectedCase ||
                isSaving ||
                !hasChanges ||
                !access.can("allocations.update")
              }
            >
              <Save className="me-2 h-4 w-4" />
              {isSaving
                ? lang === "ar"
                  ? "جاري الحفظ..."
                  : "Saving..."
                : lang === "ar"
                  ? "حفظ التخصيصات"
                  : "Save Allocations"}
            </Button>
          </div>

          {/* Allocations Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {lang === "ar" ? "الخبراء المخصصون" : "Assigned Experts"}
                  </CardTitle>
                  <CardDescription>
                    {rows.length}{" "}
                    {lang === "ar" ? "خبير(ين) مخصص" : "expert(s) assigned"}
                  </CardDescription>
                </div>
                {selectedCase && (
                  <Button
                    variant="outline"
                    onClick={addRow}
                    disabled={isSaving || !access.can("allocations.create")}
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {lang === "ar" ? "إضافة خبير" : "Add Expert"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCase ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    {lang === "ar" ? "لم يتم اختيار حالة" : "No case selected"}
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === "ar"
                      ? "يرجى اختيار حالة أولاً لعرض الخبراء المخصصين"
                      : "Please select a case first to view assigned experts"}
                  </p>
                </div>
              ) : rows.length === 0 ? (
                <div className="py-12 text-center">
                  <UserCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    {lang === "ar"
                      ? "لم يتم تخصيص خبراء"
                      : "No experts assigned"}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {lang === "ar"
                      ? "لم يتم تخصيص خبراء لهذه الحالة بعد"
                      : "No experts have been assigned to this case yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        {lang === "ar" ? "الخبير" : "Expert"}
                      </TableHead>
                      <TableHead className="w-[250px]">
                        {lang === "ar" ? "مجموعة الأدوار" : "Role Group"}
                      </TableHead>
                      <TableHead className="w-[250px]">
                        {lang === "ar" ? "الدور" : "Role"}
                      </TableHead>
                      <TableHead className="text-right">
                        {lang === "ar" ? "إجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={`${row.id || "new"}-${index}`}>
                        <TableCell>
                          <ExpertCombobox
                            value={row.expert_id}
                            onChange={(value) =>
                              updateRow(index, { expert_id: value })
                            }
                            experts={allExperts.filter(expert => expert.id === row.expert_id || experts.some(match => match.id === expert.id))}
                            placeholder={
                              lang === "ar"
                                ? "اختر خبير..."
                                : "Select expert..."
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={
                              row.role_group ??
                              roleMgmtRoles.find(
                                (role) => role.role_name_en === row.role
                              )?.role_group ??
                              ""
                            }
                            onValueChange={(value) =>
                              updateRow(index, { role_group: value, role: "" })
                            }
                            disabled={isSaving}
                          >
                            <SelectTrigger
                              aria-label={
                                lang === "ar" ? "مجموعة الأدوار" : "Role Group"
                              }
                            >
                              <SelectValue
                                placeholder={
                                  lang === "ar"
                                    ? "اختر مجموعة…"
                                    : "Select group…"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {ALLOCATION_ROLE_GROUPS.map((group) => (
                                <SelectItem
                                  key={group.id}
                                  value={group.id}
                                  disabled={
                                    !roleMgmtRoles.some(
                                      (role) =>
                                        !role.is_retired &&
                                        role.role_group === group.id
                                    )
                                  }
                                >
                                  {lang === "ar" ? group.ar : group.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={
                              isSaving ||
                              (!(
                                row.role_group ??
                                roleMgmtRoles.find(
                                  (role) => role.role_name_en === row.role
                                )?.role_group
                              ) &&
                                !row.role)
                            }
                            value={row.role}
                            onValueChange={(value) =>
                              updateRow(index, { role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  lang === "ar"
                                    ? "اختر دوراً..."
                                    : "Select role..."
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {row.role &&
                                roleMgmtRoles.find(
                                  (role) => role.role_name_en === row.role
                                )?.is_retired && (
                                  <SelectItem value={row.role}>
                                    {row.role} (
                                    {lang === "ar"
                                      ? "دور سابق"
                                      : "Previous role"}
                                    )
                                  </SelectItem>
                                )}
                              {roleMgmtRoles
                                .filter(
                                  (role) =>
                                    !role.is_retired &&
                                    role.role_group ===
                                      (row.role_group ??
                                        roleMgmtRoles.find(
                                          (item) =>
                                            item.role_name_en === row.role
                                        )?.role_group)
                                )
                                .sort(
                                  (a, b) =>
                                    (a.role_order || 0) - (b.role_order || 0)
                                )
                                .map((role) => (
                                  <SelectItem
                                    key={role.id}
                                    value={role.role_name_en}
                                  >
                                    {getRoleLabel(role)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(index)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
