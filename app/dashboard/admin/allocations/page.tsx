"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAllocations } from "@/hooks/useAllocations"
import { useUsers } from "@/hooks/useUsers"
import { CaseSearchCombobox } from "@/components/case-search-combobox"
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
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  UserCheck,
  Users,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/lang-context"
import type { ExpertRole } from "@/types/allocation"
import { EXPERT_ROLES } from "@/types/allocation"
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
import { cn, formatExpertRole } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRolesManagement } from "@/hooks/useRolesManagement"
import { useToolTypes } from "@/hooks/useToolTypes"
import { ToolTypeMultiSelect } from "@/components/admin/tool-type-multi-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
  
interface AllocationRow {
  id?: string
  expert_id: string
  role: ExpertRole
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
              lang === "ar" ? "البحث عن الخبراء..." : "Search experts..."
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
                  value={expert.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
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

export default function AllocationsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { users, isLoading: isUsersLoading } = useUsers()
  const {
    allocations,
    isLoading: isAllocationsLoading,
    addAllocation,
    removeAllocation,
    refresh: refreshAllocations,
  } = useAllocations()

  const [selectedCase, setSelectedCase] = useState<string>("")
  const [rows, setRows] = useState<AllocationRow[]>([])
  const [originalRows, setOriginalRows] = useState<AllocationRow[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const {
    roles: roleMgmtRoles,
    isLoading: isRolesLoading,
    updateRoleToolTypes,
    addRole,
    removeRole,
  } = useRolesManagement()
  const { toolTypes: allToolTypes, isLoading: isToolTypesLoading, fetchToolTypes } = useToolTypes()

  const [roleToolTypesMap, setRoleToolTypesMap] = useState<Record<string, string[]>>({})
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [isAddingRole, setIsAddingRole] = useState(false)

  useEffect(() => {
    fetchToolTypes()
  }, [fetchToolTypes])

  useEffect(() => {
    if (roleMgmtRoles.length > 0 && Object.keys(roleToolTypesMap).length === 0) {
      const map: Record<string, string[]> = {}
      roleMgmtRoles.forEach((r) => {
        map[r.id] = [...(r.tool_types || [])]
      })
      setRoleToolTypesMap(map)
    }
  }, [roleMgmtRoles])

  const handleRoleToolTypesChange = (roleId: string, toolTypeIds: string[]) => {
    setRoleToolTypesMap((prev) => ({ ...prev, [roleId]: toolTypeIds }))
  }

  const handleSaveAllRoles = async () => {
    const changed = roleMgmtRoles.filter(
      (role) =>
        JSON.stringify(roleToolTypesMap[role.id]?.sort()) !==
        JSON.stringify([...(role.tool_types || [])].sort())
    )
    if (changed.length === 0) return

    setIsSavingAll(true)
    try {
      await Promise.all(
        changed.map((role) => updateRoleToolTypes(role.id, roleToolTypesMap[role.id]))
      )
    } catch (error) {
      console.error("Failed to save role tool types:", error)
      alert(
        lang === "ar"
          ? "فشل الحفظ. يرجى المحاولة مرة أخرى."
          : "Failed to save. Please try again."
      )
    } finally {
      setIsSavingAll(false)
    }
  }

  const handleAddRole = async () => {
    const roleName = newRoleName.trim()
    if (!roleName) return

    setIsAddingRole(true)
    try {
      const created = await addRole(roleName)
      setRoleToolTypesMap((prev) => ({
        ...prev,
        [created.id]: created.tool_types || [],
      }))
      setRoleDialogOpen(false)
      setNewRoleName("")
    } catch (error) {
      console.error("Failed to add role:", error)
      alert(
        lang === "ar"
          ? "فشل إضافة الدور. يرجى المحاولة مرة أخرى."
          : "Failed to add role. Please try again."
      )
    } finally {
      setIsAddingRole(false)
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (
      !window.confirm(
        lang === "ar"
          ? `هل تريد حذف الدور "${roleName}"؟`
          : `Delete role "${roleName}"?`
      )
    ) {
      return
    }

    try {
      await removeRole(roleId)
      setRoleToolTypesMap((prev) => {
        const next = { ...prev }
        delete next[roleId]
        return next
      })
    } catch (error) {
      console.error("Failed to delete role:", error)
      alert(
        lang === "ar"
          ? "فشل حذف الدور. يرجى المحاولة مرة أخرى."
          : "Failed to delete role. Please try again."
      )
    }
  }

  // Filter only expert users
  const experts = useMemo(
    () =>
      users
        .filter((u) => u.role === "expert")
        .map((u) => ({ id: u.id, name: u.name, email: u.email })),
    [users]
  )

  // Load existing allocations when case is selected
  const loadAllocationsForCase = useCallback(
    (caseId: string) => {
      const caseAllocations = allocations.filter((a) => a.case_id === caseId)
      const loadedRows: AllocationRow[] = caseAllocations.map((a) => ({
        id: a.id,
        expert_id: a.expert_id,
        role: a.role as ExpertRole,
      }))
      setRows(loadedRows)
      setOriginalRows(loadedRows)
    },
    [allocations]
  )

  useEffect(() => {
    if (selectedCase) {
      loadAllocationsForCase(selectedCase)
    } else {
      setRows([])
      setOriginalRows([])
    }
  }, [selectedCase, loadAllocationsForCase])

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { expert_id: "", role: EXPERT_ROLES[0] },
    ])
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRow = (
    index: number,
    updates: Partial<AllocationRow>
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...updates } : row))
    )
  }

  const handleSave = async () => {
    if (!selectedCase) return

    // Validate rows
    const invalidRows = rows.filter(
      (r) => !r.expert_id || !r.role
    )
    if (invalidRows.length > 0) {
      alert(
        lang === "ar"
          ? "يرجى اختيار خبير ودور لكل صف."
          : "Please select an expert and role for each row."
      )
      return
    }

    setIsSaving(true)
    try {
      // Find removed rows
      const removedIds = originalRows
        .filter(
          (orig) => !rows.some((r) => r.id && r.id === orig.id)
        )
        .map((r) => r.id!)

      // Find updated rows (existing with changes)
      const updatedRows = rows.filter((row) => {
        if (!row.id) return false
        const original = originalRows.find((o) => o.id === row.id)
        if (!original) return false
        return (
          original.expert_id !== row.expert_id || original.role !== row.role
        )
      })

      // Find new rows
      const newRows = rows.filter((row) => !row.id)

      // Execute changes
      await Promise.all([
        // Delete removed
        ...removedIds.map((id) => removeAllocation(id)),
        // Update existing
        ...updatedRows.map((row) =>
          removeAllocation(row.id!).then(() =>
            addAllocation({
              case_id: selectedCase,
              expert_id: row.expert_id,
              role: row.role,
            })
          )
        ),
        // Create new
        ...newRows.map((row) =>
          addAllocation({
            case_id: selectedCase,
            expert_id: row.expert_id,
            role: row.role,
          })
        ),
      ])

      // Refresh and update original rows
      await refreshAllocations()
    } catch (error) {
      console.error("Failed to save allocations:", error)
      alert(
        lang === "ar"
          ? "فشل حفظ التخصيصات. يرجى المحاولة مرة أخرى."
          : "Failed to save allocations. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = isUsersLoading || isAllocationsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {lang === "ar" ? "نموذج التخصيص" : "Allocation Form"}
              </h1>
              <p className="text-muted-foreground">
                {lang === "ar"
                  ? "تخصيص القضايا للخبراء"
                  : "Allocate cases to experts"}
              </p>
            </div>
          </div>
        </div>
        <SkeletonTable rows={4} />
      </div>
    )
  }

  const hasChanges =
    JSON.stringify(rows) !== JSON.stringify(originalRows)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "ar" ? "نموذج التخصيص" : "Allocation Form"}
            </h1>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "تخصيص القضايا للخبراء"
                : "Allocate cases to experts"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="allocations">
        <TabsList>
          <TabsTrigger value="allocations">
            {lang === "ar" ? "التخصيصات" : "Allocations"}
          </TabsTrigger>
          <TabsTrigger value="roles">
            {lang === "ar" ? "الأدوار" : "Roles"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!selectedCase || isSaving || !hasChanges}
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

          {/* Case Selector */}
          <Card>
            <CardHeader>
              <CardTitle>
                {lang === "ar" ? "اختيار القضية" : "Select Case"}
              </CardTitle>
              <CardDescription>
                {lang === "ar"
                  ? "اختر القضية التي تريد تخصيص الخبراء لها"
                  : "Choose the case you want to allocate experts to"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <CaseSearchCombobox
                  value={selectedCase}
                  onChange={setSelectedCase}
                  placeholder={
                    lang === "ar" ? "اختر قضية..." : "Select a case..."
                  }
                />
              </div>
            </CardContent>
          </Card>

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
                    disabled={isSaving}
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
                    {lang === "ar"
                      ? "لم يتم اختيار قضية"
                      : "No case selected"}
                  </h3>
                  <p className="text-muted-foreground">
                    {lang === "ar"
                      ? "يرجى اختيار قضية أولاً لعرض الخبراء المخصصين"
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
                      ? "لم يتم تخصيص خبراء لهذه القضية بعد"
                      : "No experts have been assigned to this case yet"}
                  </p>
                  <Button onClick={addRow}>
                    <Plus className="me-2 h-4 w-4" />
                    {lang === "ar" ? "إضافة خبير" : "Add Expert"}
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        {lang === "ar" ? "الخبير" : "Expert"}
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
                            experts={experts}
                            placeholder={
                              lang === "ar"
                                ? "اختر خبير..."
                                : "Select expert..."
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.role}
                            onValueChange={(value) =>
                              updateRow(index, {
                                role: value as ExpertRole,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPERT_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {formatExpertRole(role)}
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
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {lang === "ar" ? "إدارة أدوار الخبراء" : "Expert Role Management"}
                  </CardTitle>
                  <CardDescription>
                    {lang === "ar"
                      ? "تحديد أنواع الأدوات المتاحة لكل دور"
                      : "Assign which tool types each role can access"}
                  </CardDescription>
                </div>
                <Button onClick={() => setRoleDialogOpen(true)}>
                  <Plus className="me-2 h-4 w-4" />
                  {lang === "ar" ? "إضافة دور" : "Add Role"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isRolesLoading || isToolTypesLoading ? (
                <SkeletonTable rows={4} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {lang === "ar" ? "الدور" : "Role"}
                      </TableHead>
                      <TableHead>
                        {lang === "ar" ? "أنواع الأدوات المخصصة" : "Assigned Tool Types"}
                      </TableHead>
                      <TableHead className="text-right">
                        {lang === "ar" ? "إجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleMgmtRoles.map((role) => {
                      const hasAssignments = allocations.some(
                        (a) => a.role === role.name
                      )
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium capitalize">
                            {role.name}
                          </TableCell>
                          <TableCell>
                            <ToolTypeMultiSelect
                              value={roleToolTypesMap[role.id] || role.tool_types || []}
                              onChange={(toolTypeIds) =>
                                handleRoleToolTypesChange(role.id, toolTypeIds)
                              }
                              toolTypes={allToolTypes}
                              lang={lang}
                              placeholder={
                                lang === "ar"
                                  ? "اختر أنواع الأدوات..."
                                  : "Select tool types..."
                              }
                              emptyMessage={
                                lang === "ar"
                                  ? "لا توجد أنواع أدوات"
                                  : "No tool types found"
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={hasAssignments || isSavingAll}
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              title={
                                hasAssignments
                                  ? lang === "ar"
                                    ? "لا يمكن حذف دور معين لخبراء"
                                    : "Cannot delete a role assigned to experts"
                                  : undefined
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSaveAllRoles}
                  disabled={isSavingAll}
                >
                  {isSavingAll
                    ? lang === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : lang === "ar"
                      ? "حفظ الكل"
                      : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "إضافة دور جديد" : "Add New Role"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "أدخل اسم الدور الجديد ثم قم بتحديد أنواع الأدوات المتاحة له"
                : "Enter a name for the new role, then assign the tool types it can access"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {lang === "ar" ? "اسم الدور" : "Role Name"}
              </label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder={lang === "ar" ? "مثال: محامي" : "e.g., lawyer"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRoleDialogOpen(false)
                setNewRoleName("")
              }}
              disabled={isAddingRole}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleAddRole}
              disabled={isAddingRole || !newRoleName.trim()}
            >
              {isAddingRole
                ? lang === "ar"
                  ? "جارٍ الإضافة..."
                  : "Adding..."
                : lang === "ar"
                  ? "إضافة"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
