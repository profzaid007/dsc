import { useAppStore } from "@/lib/store"
import type { ProfileTool } from "@/types/assignment"

export function useAssignments() {
  const assignments = useAppStore((state) => state.assignments)
  const responses = useAppStore((state) => state.responses)

  const assignTool = useAppStore((state) => state.assignTool)
  const updateAssignment = useAppStore((state) => state.updateAssignment)
  const deleteAssignment = useAppStore((state) => state.deleteAssignment)
  const getAssignmentsByProfile = useAppStore(
    (state) => state.getAssignmentsByProfile
  )
  const getVisibleAssignments = useAppStore(
    (state) => state.getVisibleAssignments
  )
  const submitResponse = useAppStore((state) => state.submitResponse)
  const getResponsesByAssignment = useAppStore(
    (state) => state.getResponsesByAssignment
  )

  return {
    assignments,
    responses,
    assignTool,
    updateAssignment,
    deleteAssignment,
    getAssignmentsByProfile,
    getVisibleAssignments,
    submitResponse,
    getResponsesByAssignment,
  }
}
