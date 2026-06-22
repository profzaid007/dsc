import pb from "./pb"
import type { User } from "@/types/user"
import type { Profile } from "@/types/profile"
import type { Tool, BilingualString } from "@/types/tool"
import type { CaseTool } from "@/types/assignment"
import type { BlogPage, InfoPage, HomePage } from "@/types/cms"
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

    // Preserve existing media files when adding new ones (PocketBase replaces all if not included)
    if (files.length > 0 && (!filesToRemove || filesToRemove.length === 0)) {
      const existing = await pb.collection("case_tools").getOne(id)
      if (existing.media && Array.isArray(existing.media)) {
        existing.media.forEach((filename: string) => {
          formData.append("media", filename)
        })
      }
    }

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

export const infoPagesCollection = {
  async getBySlug(slug: string): Promise<InfoPage | null> {
    try {
      const data = await pb.collection("info_pages").getFirstListItem(`slug = "${slug}"`)
      return data as unknown as InfoPage
    } catch {
      return null
    }
  },

  async getPublishedBySlug(slug: string): Promise<InfoPage | null> {
    try {
      const data = await pb
        .collection("info_pages")
        .getFirstListItem(`slug = "${slug}" && is_published = true`)
      return data as unknown as InfoPage
    } catch {
      return null
    }
  },

  async create(data: { slug: string; title: string; content_en?: string }): Promise<InfoPage> {
    const lorem =
      "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>"
    const result = await pb.collection("info_pages").create({
      slug: data.slug,
      title: data.title,
      content_en: data.content_en || lorem,
      is_published: false,
    })
    return result as unknown as InfoPage
  },

  async update(id: string, data: Partial<InfoPage>): Promise<InfoPage> {
    const result = await pb.collection("info_pages").update(id, data)
    return result as unknown as InfoPage
  },

  async updateWithFiles(
    id: string,
    data: Partial<InfoPage>,
    files: File[],
    filesToRemove?: string[]
  ): Promise<InfoPage> {
    const formData = new FormData()

    // Preserve existing media files when adding new ones (PocketBase replaces all if not included)
    if (files.length > 0 && (!filesToRemove || filesToRemove.length === 0)) {
      const existing = await pb.collection("info_pages").getOne(id)
      if (existing.media && Array.isArray(existing.media)) {
        existing.media.forEach((filename: string) => {
          formData.append("media", filename)
        })
      }
    }

    if (data.title !== undefined) formData.append("title", data.title)
    if (data.content_en !== undefined) formData.append("content_en", data.content_en)
    if (data.is_published !== undefined) formData.append("is_published", String(data.is_published))

    files.forEach((file) => {
      formData.append("media", file)
    })

    if (filesToRemove && filesToRemove.length > 0) {
      formData.append("media-", filesToRemove.join(","))
    }

    const result = await pb.collection("info_pages").update(id, formData)
    return result as unknown as InfoPage
  },

  async delete(id: string): Promise<void> {
    await pb.collection("info_pages").delete(id)
  },
}

export const homePagesCollection = {
  async getBySlug(slug: string): Promise<HomePage | null> {
    try {
      const data = await pb.collection("home_pages").getFirstListItem(`slug = "${slug}"`)
      return data as unknown as HomePage
    } catch {
      return null
    }
  },

  async getPublishedBySlug(slug: string): Promise<HomePage | null> {
    try {
      const data = await pb
        .collection("home_pages")
        .getFirstListItem(`slug = "${slug}" && is_published = true`)
      return data as unknown as HomePage
    } catch {
      return null
    }
  },

  async create(data: { slug: string; title: string; content_en?: string }): Promise<HomePage> {
    const lorem = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
    const result = await pb.collection("home_pages").create({
      slug: data.slug,
      title_en: data.title,
      content_en: data.content_en || lorem,
      is_published: false,
    })
    return result as unknown as HomePage
  },

  async update(id: string, data: Partial<HomePage>): Promise<HomePage> {
    const result = await pb.collection("home_pages").update(id, data)
    return result as unknown as HomePage
  },

  async updateWithFiles(
    id: string,
    data: Partial<HomePage>,
    files: File[],
    filesToRemove?: string[]
  ): Promise<HomePage> {
    const formData = new FormData()

    if (files.length > 0 && (!filesToRemove || filesToRemove.length === 0)) {
      const existing = await pb.collection("home_pages").getOne(id)
      if (existing.media && Array.isArray(existing.media)) {
        existing.media.forEach((filename: string) => {
          formData.append("media", filename)
        })
      }
    }

    if (data.title_en !== undefined) formData.append("title_en", data.title_en)
    if (data.content_en !== undefined) formData.append("content_en", data.content_en)
    if (data.is_published !== undefined) formData.append("is_published", String(data.is_published))

    files.forEach((file) => {
      formData.append("media", file)
    })

    if (filesToRemove && filesToRemove.length > 0) {
      formData.append("media-", filesToRemove.join(","))
    }

    const result = await pb.collection("home_pages").update(id, formData)
    return result as unknown as HomePage
  },

  async delete(id: string): Promise<void> {
    await pb.collection("home_pages").delete(id)
  },
}

function extractAuthorFromRecord(record: any): string {
  return (record.author_name as string) || ""
}

export const blogPagesCollection = {
  async getAll(): Promise<BlogPage[]> {
    const data = await pb.collection("blog_pages").getFullList({
      sort: "-created",
    })
    return data.map((item) => {
      const author_name = extractAuthorFromRecord(item)
      return {
        id: item.id as string,
        slug: item.slug as string,
        title_en: item.title_en as string,
        category: item.category as string,
        content_en: item.content_en as string,
        is_published: item.is_published as boolean,
        media: (item.media as string[]) || [],
        author_name,
        created: item.created as string,
        updated: item.updated as string,
      }
    })
  },

  async getBySlug(slug: string): Promise<BlogPage | null> {
    try {
      const data = await pb
        .collection("blog_pages")
        .getFirstListItem(`slug = "${slug}"`)
      const author_name = extractAuthorFromRecord(data)
      return {
        id: data.id as string,
        slug: data.slug as string,
        title_en: data.title_en as string,
        category: data.category as string,
        content_en: data.content_en as string,
        is_published: data.is_published as boolean,
        media: (data.media as string[]) || [],
        author_name,
        created: data.created as string,
        updated: data.updated as string,
      }
    } catch {
      return null
    }
  },

  async getPublishedBySlug(slug: string): Promise<BlogPage | null> {
    try {
      const data = await pb
        .collection("blog_pages")
        .getFirstListItem(`slug = "${slug}" && is_published = true`)
      const author_name = extractAuthorFromRecord(data)
      return {
        id: data.id as string,
        slug: data.slug as string,
        title_en: data.title_en as string,
        category: data.category as string,
        content_en: data.content_en as string,
        is_published: data.is_published as boolean,
        media: (data.media as string[]) || [],
        author_name,
        created: data.created as string,
        updated: data.updated as string,
      }
    } catch {
      return null
    }
  },

  async create(data: {
    slug: string
    title: string
    category?: string
    content_en?: string
    author_name?: string
  }): Promise<BlogPage> {
    const lorem =
      "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
    const result = await pb.collection("blog_pages").create({
      slug: data.slug,
      title_en: data.title,
      category: data.category || "",
      content_en: data.content_en || lorem,
      is_published: false,
      author_name: data.author_name || "",
    })
    const author_name = extractAuthorFromRecord(result)
    return {
      id: result.id as string,
      slug: result.slug as string,
      title_en: result.title_en as string,
      category: result.category as string,
      content_en: result.content_en as string,
      is_published: result.is_published as boolean,
      media: (result.media as string[]) || [],
      author_name,
      created: result.created as string,
      updated: result.updated as string,
    }
  },

  async update(id: string, data: Partial<BlogPage>): Promise<BlogPage> {
    const result = await pb.collection("blog_pages").update(id, data)
    const author_name = extractAuthorFromRecord(result)
    return {
      id: result.id as string,
      slug: result.slug as string,
      title_en: result.title_en as string,
      category: result.category as string,
      content_en: result.content_en as string,
      is_published: result.is_published as boolean,
      media: (result.media as string[]) || [],
      author_name,
      created: result.created as string,
      updated: result.updated as string,
    }
  },

  async updateWithFiles(
    id: string,
    data: Partial<BlogPage>,
    files: File[],
    filesToRemove?: string[]
  ): Promise<BlogPage> {
    const formData = new FormData()

    // Preserve existing media files when adding new ones
    if (files.length > 0 && (!filesToRemove || filesToRemove.length === 0)) {
      const existing = await pb.collection("blog_pages").getOne(id)
      if (existing.media && Array.isArray(existing.media)) {
        existing.media.forEach((filename: string) => {
          formData.append("media", filename)
        })
      }
    }

    if (data.title_en !== undefined) formData.append("title_en", data.title_en)
    if (data.slug !== undefined) formData.append("slug", data.slug)
    if (data.category !== undefined) formData.append("category", data.category)
    if (data.content_en !== undefined) formData.append("content_en", data.content_en)
    if (data.is_published !== undefined)
      formData.append("is_published", String(data.is_published))
    if (data.author_name !== undefined) formData.append("author_name", data.author_name)

    files.forEach((file) => {
      formData.append("media", file)
    })

    if (filesToRemove && filesToRemove.length > 0) {
      formData.append("media-", filesToRemove.join(","))
    }

    const result = await pb.collection("blog_pages").update(id, formData)
    return result as unknown as BlogPage
  },

  async delete(id: string): Promise<void> {
    await pb.collection("blog_pages").delete(id)
  },
}

export const blogCategoriesCollection = {
  async getAll(): Promise<{ id: string; name: string }[]> {
    const data = await pb.collection("blog_categories").getFullList({
      sort: "name",
    })
    return data.map((item) => ({
      id: item.id as string,
      name: item.name as string,
    }))
  },

  async create(name: string): Promise<{ id: string; name: string }> {
    const result = await pb.collection("blog_categories").create({ name })
    return { id: result.id as string, name: result.name as string }
  },

  async delete(id: string): Promise<void> {
    await pb.collection("blog_categories").delete(id)
  },
}

export { handlePocketBaseError }
export type { User, Tool, Profile, CaseTool }
