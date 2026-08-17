export interface InfoPage {
  id: string
  slug: string
  portal_name?: string
  title_en: string
  title_ar?: string
  content_en: string
  content_ar?: string
  is_published: boolean
  media: string[]
  icon?: string
  order: number
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
  thumbnail: string
  author_name: string
  created: string
  updated: string
}

export interface BlogCategory {
  id: string
  key: string
  label_en: string
  label_ar?: string
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
