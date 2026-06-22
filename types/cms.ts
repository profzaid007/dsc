export interface InfoPage {
  id: string
  slug: string
  title: string
  content_en: string
  content_ar?: string
  is_published: boolean
  media: string[]
  created: string
  updated: string
}

export interface BlogPage {
  id: string
  slug: string
  title_en: string
  title_ar?: string
  category: string
  content_en: string
  content_ar?: string
  is_published: boolean
  media: string[]
  author_name: string
  created: string
  updated: string
}

export interface BlogCategory {
  id: string
  name: string
}

export interface HomePage {
  id: string
  slug: string
  title_en: string
  title_ar?: string
  content_en: string
  content_ar?: string
  is_published: boolean
  media: string[]
  created: string
  updated: string
}
