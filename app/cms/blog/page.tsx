"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { blogPagesCollection } from "@/lib/pb-collections"
import { BlogPage } from "@/types/cms"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Plus, Pencil, Trash2, Settings } from "lucide-react"

export default function CmsBlogListPage() {
  const [posts, setPosts] = useState<BlogPage[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    blogPagesCollection
      .getAll()
      .then((data) => {
        setPosts(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleNewPost = async () => {
    setCreating(true)
    const slug = `new-post-${Date.now()}`
    try {
      const newPost = await blogPagesCollection.create({
        slug,
        title: "New Post",
        category: "",
      })
      router.push(`/cms/blog/${newPost.slug}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await blogPagesCollection.delete(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cms/blog/categories">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </Link>
          <Button onClick={handleNewPost} disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Post
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No posts yet.</p>
          <Button onClick={handleNewPost} className="mt-4" disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create your first post
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/cms/blog/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{post.slug}
                  </TableCell>
                  <TableCell>{post.author_name || "—"}</TableCell>
                  <TableCell>
                    {new Date(post.updated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {post.is_published ? (
                      <Badge
                        variant="default"
                        className="bg-green-600 text-white"
                      >
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/cms/blog/${post.slug}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id, post.title)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
