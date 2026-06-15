export interface InfoPage {
  id: string
  slug: string
  title: string
  content: string
  is_published: boolean
  media: string[]
  created: string
  updated: string
}

export interface BlogPage {
  id: string
  slug: string
  title: string
  category: string
  content: string
  is_published: boolean
  media: string[]
  author_id: string
  author_name: string
  created: string
  updated: string
}

export interface BlogCategory {
  id: string
  name: string
}
