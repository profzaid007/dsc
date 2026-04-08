import pb from "./pb"
import type { User } from "@/types/user"
import type { Profile } from "@/types/profile"
import type { Tool } from "@/types/tool"
import type { CaseTool } from "@/types/assignment"
import { handlePocketBaseError } from "./pb"

export const toolsCollection = {
  async getAll(): Promise<Tool[]> {
    return pb.collection("tools").getFullList()
  },

  async getById(id: string): Promise<Tool> {
    return pb.collection("tools").getOne(id)
  },

  async create(data: Partial<Tool>): Promise<Tool> {
    return pb.collection("tools").create(data)
  },

  async update(id: string, data: Partial<Tool>): Promise<Tool> {
    return pb.collection("tools").update(id, data)
  },

  async delete(id: string): Promise<void> {
    await pb.collection("tools").delete(id)
  },

  async getByType(type: string): Promise<Tool[]> {
    return pb.collection("tools").getFullList({
      filter: `type = "${type}"`,
    })
  },

  async getActive(): Promise<Tool[]> {
    return pb.collection("tools").getFullList({
      filter: `status = "active"`,
    })
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

  async delete(id: string): Promise<void> {
    await pb.collection("case_tools").delete(id)
  },

  async getByCase(caseId: string): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList({
      filter: `case = "${caseId}"`,
    })
  },

  async getVisibleToUser(caseId: string): Promise<CaseTool[]> {
    return pb.collection("case_tools").getFullList({
      filter: `case = "${caseId}" && is_visible_to_user = true`,
    })
  },
}

export { handlePocketBaseError }
export type { User, Tool, Profile, CaseTool }
