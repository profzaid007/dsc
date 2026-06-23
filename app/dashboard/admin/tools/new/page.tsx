"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/lang-context"
import { useToolTypes } from "@/hooks/useToolTypes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  getToolTypeLabel,
  getToolTypeMeta,
  toolTypeOrder,
} from "@/lib/tool-types"

export default function NewToolPage() {
  const router = useRouter()
  const { lang } = useLang()
  const { toolTypes, fetchToolTypes } = useToolTypes()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchToolTypes()
  }, [fetchToolTypes])

  const visibleToolTypes = toolTypeOrder.flatMap((key) => {
    const toolType = toolTypes.find((item) => item.key === key)
    const meta = getToolTypeMeta(key)
    if (!toolType || !meta) return []

    return [
      {
        ...toolType,
        icon: meta.icon,
        href: `/dashboard/admin/tools/${meta.route}/new`,
      },
    ]
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          ←
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Create Tool</h1>
          <p className="text-muted-foreground">Select a tool type to create</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleToolTypes.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <tool.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{getToolTypeLabel(tool, lang)}</CardTitle>
                </div>
                {/* <CardDescription>
                  {tool.key.replaceAll("_", " ")}
                </CardDescription> */}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
