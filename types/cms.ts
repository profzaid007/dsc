export interface InfoPage {
  id: string
  slug: string
  title: string
  content_en: string
  is_published: boolean
  media: string[]
  created: string
  updated: string
}

export interface BlogPage {
  id: string
  slug: string
  title_en: string
  category: string
  content_en: string
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
  content_en: string
  is_published: boolean
  media: string[]
  created: string
  updated: string
}
