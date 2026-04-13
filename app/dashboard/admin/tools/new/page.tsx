"use client"

import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Brain, Image, FileBarChart, Layers } from "lucide-react"
import Link from "next/link"
import type { ToolType } from "@/types/tool"

const toolTypes: {
  type: ToolType
  label: { en: string; ar: string }
  icon: typeof FileText
  description: { en: string; ar: string }
  href: string
}[] = [
  {
    type: "survey",
    label: { en: "Survey", ar: "استبيان" },
    icon: FileText,
    description: {
      en: "Questions with answer types + options",
      ar: "أسئلة بأنواع إجابات + خيارات",
    },
    href: "/dashboard/admin/tools/survey/new",
  },
  {
    type: "multiple_answer",
    label: { en: "Multiple Answer Builder", ar: "بناء الإجابات المتعددة" },
    icon: Brain,
    description: {
      en: "Quiz with correct answer(s)",
      ar: "اختبار بإجابة صحيحة",
    },
    href: "/dashboard/admin/tools/multiple-choice/new",
  },
  {
    type: "media_question",
    label: { en: "Media Questions", ar: "أسئلة الوسائط" },
    icon: Image,
    description: {
      en: "Image/video/audio + question",
      ar: "صورة/فيديو/صوت + سؤال",
    },
    href: "/dashboard/admin/tools/media/new",
  },
  {
    type: "report",
    label: { en: "Report", ar: "تقرير" },
    icon: FileBarChart,
    description: {
      en: "Fixed fields + custom fields",
      ar: "حقول ثابتة + حقول مخصصة",
    },
    href: "/dashboard/admin/tools/report/new",
  },
  {
    type: "plan",
    label: { en: "Plan", ar: "خطة" },
    icon: Layers,
    description: {
      en: "Child info, goals, steps",
      ar: "معلومات الطفل، الأهداف، الخطوات",
    },
    href: "/dashboard/admin/tools/plan/new",
  },
]

export default function NewToolPage() {
  const router = useRouter()

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
        {toolTypes.map((tool) => (
          <Link key={tool.type} href={tool.href}>
            <Card className="h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <tool.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{tool.label.en}</CardTitle>
                </div>
                <CardDescription>{tool.description.en}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
