import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types/user"
import type { Profile } from "@/types/profile"
import type { Tool, ToolType } from "@/types/tool"
import type { ProfileTool, ToolResponse } from "@/types/assignment"

const VALID_TOOL_TYPES: ToolType[] = [
  "survey",
  "multiple_choice",
  "media",
  "report",
  "plan",
]

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function migrateTools(tools: Tool[]): Tool[] {
  return tools.filter((tool) => VALID_TOOL_TYPES.includes(tool.type))
}

interface AppState {
  currentUser: User | null
  users: User[]
  profiles: Profile[]
  tools: Tool[]
  assignments: ProfileTool[]
  responses: ToolResponse[]

  hydrateTools: () => void

  login: (email: string, name?: string, role?: User["role"]) => User
  logout: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean

  addProfile: (
    profile: Omit<Profile, "id" | "createdAt" | "updatedAt">
  ) => string
  updateProfile: (id: string, data: Partial<Profile>) => void
  deleteProfile: (id: string) => void
  getProfileById: (id: string) => Profile | undefined
  getProfilesByUser: (userId: string) => Profile[]

  addTool: (tool: Omit<Tool, "id" | "createdAt" | "updatedAt">) => string
  updateTool: (id: string, data: Partial<Tool>) => void
  deleteTool: (id: string) => void
  getToolById: (id: string) => Tool | undefined
  getToolsByType: (type: Tool["type"]) => Tool[]
  getToolsByServiceType: (serviceType: Tool["serviceType"]) => Tool[]

  assignTool: (profileId: string, toolId: string, assignedBy: string) => string
  updateAssignment: (id: string, data: Partial<ProfileTool>) => void
  deleteAssignment: (id: string) => void
  getAssignmentsByProfile: (profileId: string) => ProfileTool[]
  getVisibleAssignments: (profileId: string) => ProfileTool[]

  submitResponse: (
    assignmentId: string,
    data: Record<string, unknown>,
    isInternal?: boolean
  ) => void
  getResponsesByAssignment: (assignmentId: string) => ToolResponse[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      profiles: [],
      tools: migrateTools([]),
      assignments: [],
      responses: [],

      login: (email: string, name?: string, role?: User["role"]) => {
        const existingUser = get().users.find((u) => u.email === email)
        if (existingUser) {
          set({ currentUser: existingUser })
          return existingUser
        }
        const newUser: User = {
          id: generateId(),
          name: name || email.split("@")[0],
          email,
          type: "individual",
          role: role || "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          currentUser: newUser,
          users: [...state.users, newUser],
        }))
        return newUser
      },

      logout: () => set({ currentUser: null }),

      isAuthenticated: () => get().currentUser !== null,

      isAdmin: () => get().currentUser?.role === "admin",

      hydrateTools: () => {
        const currentTools = get().tools
        const migrated = migrateTools(currentTools)
        if (migrated.length !== currentTools.length) {
          set({ tools: migrated })
        }
      },

      addProfile: (profile) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newProfile: Profile = {
          ...profile,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ profiles: [...state.profiles, newProfile] }))
        return id
      },

      updateProfile: (id, data) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id
              ? { ...p, ...data, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }))
      },

      getProfileById: (id) => get().profiles.find((p) => p.id === id),

      getProfilesByUser: (userId) =>
        get().profiles.filter((p) => p.userId === userId),

      addTool: (tool) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newTool: Tool = {
          ...tool,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ tools: [...state.tools, newTool] }))
        return id
      },

      updateTool: (id, data) => {
        set((state) => ({
          tools: state.tools.map((t) =>
            t.id === id
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      deleteTool: (id) => {
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        }))
      },

      getToolById: (id) => get().tools.find((t) => t.id === id),

      getToolsByType: (type) => get().tools.filter((t) => t.type === type),

      getToolsByServiceType: (serviceType) =>
        get().tools.filter(
          (t) => t.serviceType === serviceType || t.serviceType === "both"
        ),

      assignTool: (profileId, toolId, assignedBy) => {
        const id = generateId()
        const now = new Date().toISOString()
        const tool = get().getToolById(toolId)
        const newAssignment: ProfileTool = {
          id,
          profileId,
          toolId,
          assignedBy,
          status: "assigned",
          isVisibleToUser: tool?.isVisibleToUser ?? false,
          responseData: {},
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ assignments: [...state.assignments, newAssignment] }))
        return id
      },

      updateAssignment: (id, data) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id
              ? { ...a, ...data, updatedAt: new Date().toISOString() }
              : a
          ),
        }))
      },

      deleteAssignment: (id) => {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        }))
      },

      getAssignmentsByProfile: (profileId) =>
        get().assignments.filter((a) => a.profileId === profileId),

      getVisibleAssignments: (profileId) =>
        get().assignments.filter(
          (a) => a.profileId === profileId && a.isVisibleToUser
        ),

      submitResponse: (assignmentId, data, isInternal = false) => {
        const response: ToolResponse = {
          id: generateId(),
          profileToolId: assignmentId,
          data,
          submittedAt: new Date().toISOString(),
          isInternal,
        }
        set((state) => ({ responses: [...state.responses, response] }))

        const assignment = get().assignments.find((a) => a.id === assignmentId)
        if (assignment) {
          get().updateAssignment(assignmentId, {
            status: "completed",
            completedAt: new Date().toISOString(),
            responseData: data,
          })
        }
      },

      getResponsesByAssignment: (assignmentId) =>
        get().responses.filter((r) => r.profileToolId === assignmentId),
    }),
    {
      name: "dsc-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
