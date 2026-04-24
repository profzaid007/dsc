import pb from "./pb"
import type { User } from "@/types/user"
import type { Profile } from "@/types/profile"
import type { Tool, BilingualString } from "@/types/tool"
import type { CaseTool } from "@/types/assignment"
import { handlePocketBaseError } from "./pb"

// Transform flat DB fields to nested TypeScript objects
function transformToolFromDB(dbTool: Record<string, unknown>): Tool {
  return {
    id: dbTool.id as string,
    name: {
      en: (dbTool.name_en as string) || "",
      ar: (dbTool.name_ar as string) || "",
    },
    description: (dbTool.description as string) || "",
    type: dbTool.type as Tool["type"],
    serviceType: (dbTool.serviceType as Tool["serviceType"]) || "individual",
    status: (dbTool.status as Tool["status"]) || "active",
    config: (dbTool.config as Tool["config"]) || {},
    created: dbTool.created as string,
    updated: dbTool.updated as string,
  }
}

// Transform nested TypeScript objects to flat DB fields
function transformToolToDB(tool: Partial<Tool>): Record<string, unknown> {
  const dbData: Record<string, unknown> = {}

  if (tool.name) {
    dbData.name_en = tool.name.en
    dbData.name_ar = tool.name.ar
  }
  if (tool.description) {
    dbData.description = tool.description
  }
  if (tool.type) dbData.type = tool.type
  if (tool.serviceType) dbData.serviceType = tool.serviceType
  if (tool.status) dbData.status = tool.status
  if (tool.config) dbData.config = tool.config

  return dbData
}

export const toolsCollection = {
  async getAll(): Promise<Tool[]> {
    const data = await pb.collection("tools").getFullList()
    return data.map(transformToolFromDB)
  },

  async getById(id: string): Promise<Tool> {
    const data = await pb.collection("tools").getOne(id)
    return transformToolFromDB(data)
  },

  async create(data: Partial<Tool>): Promise<Tool> {
    const dbData = transformToolToDB(data)
    const result = await pb.collection("tools").create(dbData)
    return transformToolFromDB(result)
  },

  async update(id: string, data: Partial<Tool>): Promise<Tool> {
    const dbData = transformToolToDB(data)
    const result = await pb.collection("tools").update(id, dbData)
    return transformToolFromDB(result)
  },

  async delete(id: string): Promise<void> {
    await pb.collection("tools").delete(id)
  },

  async getByType(type: string): Promise<Tool[]> {
    const data = await pb.collection("tools").getFullList({
      filter: `type = "${type}"`,
    })
    return data.map(transformToolFromDB)
  },

  async getActive(): Promise<Tool[]> {
    const data = await pb.collection("tools").getFullList({
      filter: `status = "active"`,
    })
    return data.map(transformToolFromDB)
  },
}

export const casesCollection = {
  async getAll(): Promise<Profile[]> {
    return pb.collection("cases").getFullList()
  },

  async getById(id: string): Promise<Profile> {
    return pb.collection("cases").getOne(id)
  },

  async create(data: Partial<Profile>): Promise<Profile> {
    return pb.collection("cases").create(data)
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile> {
    return pb.collection("cases").update(id, data)
  },

  async delete(id: string): Promise<void> {
    await pb.collection("cases").delete(id)
  },

  async getByUser(userId: string): Promise<Profile[]> {
    return pb.collection("cases").getFullList({
      filter: `user = "${userId}"`,
    })
  },
}

export const caseToolsCollection = {
  async getAll(): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList()
  },

  async getById(id: string): Promise<CaseTool> {
    return pb.collection("case_tools").getOne(id)
  },

  async create(data: Partial<CaseTool>): Promise<CaseTool> {
    return pb.collection("case_tools").create(data)
  },

  async update(id: string, data: Partial<CaseTool>): Promise<CaseTool> {
    return pb.collection("case_tools").update(id, data)
  },

  // Update with file uploads using FormData
  async updateWithFiles(
    id: string,
    data: Partial<CaseTool>,
    files: File[],
    filesToRemove?: string[]
  ): Promise<CaseTool> {
    const formData = new FormData()

    // Add files to upload
    files.forEach((file) => {
      formData.append("media", file)
    })

    // Add other data fields
    if (data.responses !== undefined) {
      formData.append("responses", JSON.stringify(data.responses))
    }
    if (data.status !== undefined) {
      formData.append("status", data.status)
    }
    if (data.name_en !== undefined) {
      formData.append("name_en", data.name_en)
    }
    if (data.name_ar !== undefined) {
      formData.append("name_ar", data.name_ar)
    }
    if (data.is_visible_to_user !== undefined) {
      formData.append("is_visible_to_user", String(data.is_visible_to_user))
    }

    // Remove files if specified
    if (filesToRemove && filesToRemove.length > 0) {
      formData.append("media-", filesToRemove.join(","))
    }

    return pb.collection("case_tools").update(id, formData)
  },

  async delete(id: string): Promise<void> {
    await pb.collection("case_tools").delete(id)
  },

  async getByCase(caseId: string): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList({
      filter: `case = "${caseId}"`,
    })
  },

  async getByTool(toolId: string): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList({
      filter: `tool = "${toolId}"`,
    })
  },

  async getVisibleToUser(caseId: string): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList({
      filter: `case = "${caseId}" && is_visible_to_user = true`,
    })
  },
}

// Tool Types Collection with caching
const toolTypesCache: Map<string, { id: string; name: string }> = new Map()

export const toolTypesCollection = {
  async getAll(): Promise<{ id: string; name: string }[]> {
    const data = await pb.collection("tool_types").getFullList()
    // Update cache
    data.forEach((type) => {
      toolTypesCache.set(type.name, { id: type.id, name: type.name })
    })
    return data.map((type) => ({ id: type.id, name: type.name }))
  },

  async getByName(name: string): Promise<{ id: string; name: string }> {
    // Check cache first
    if (toolTypesCache.has(name)) {
      return toolTypesCache.get(name)!
    }

    // Fetch from DB
    try {
      const type = await pb
        .collection("tool_types")
        .getFirstListItem(`name = "${name}"`)
      // Cache it
      toolTypesCache.set(name, { id: type.id, name: type.name })
      return { id: type.id, name: type.name }
    } catch (error) {
      console.error(`Tool type "${name}" not found`)
      throw new Error(`Tool type "${name}" not found`)
    }
  },

  // Get by ID (useful when you have the type ID from case_tools)
  async getById(id: string): Promise<{ id: string; name: string }> {
    // Check cache first
    for (const [name, typeData] of toolTypesCache.entries()) {
      if (typeData.id === id) {
        return typeData
      }
    }

    // Fetch from DB
    const type = await pb.collection("tool_types").getOne(id)
    const result = { id: type.id, name: type.name }
    toolTypesCache.set(type.name, result)
    return result
  },

  // Clear cache (useful if tool types are modified)
  clearCache() {
    toolTypesCache.clear()
  },
}

export { handlePocketBaseError }
export type { User, Tool, Profile, CaseTool }
