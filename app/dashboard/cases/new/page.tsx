"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProfiles } from "@/hooks/useProfiles"
import { useAuth } from "@/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const GRADES = [
  { value: "kg1", label: "KG 1" },
  { value: "kg2", label: "KG 2" },
  { value: "grade1", label: "Grade 1" },
  { value: "grade2", label: "Grade 2" },
  { value: "grade3", label: "Grade 3" },
  { value: "grade4", label: "Grade 4" },
  { value: "grade5", label: "Grade 5" },
  { value: "grade6", label: "Grade 6" },
  { value: "grade7", label: "Grade 7" },
  { value: "grade8", label: "Grade 8" },
  { value: "grade9", label: "Grade 9" },
  { value: "grade10", label: "Grade 10" },
  { value: "grade11", label: "Grade 11" },
  { value: "grade12", label: "Grade 12" },
  { value: "university", label: "University" },
]

const CONCERNS = [
  "Academic Performance",
  "Behavior Issues",
  "Social Skills",
  "Emotional Regulation",
  "Attention/Focus",
  "Learning Differences",
  "Communication",
  "Motor Skills",
  "Other",
]

export default function NewProfilePage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { addProfile } = useProfiles()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    gender: "",
    grade: "",
    main_concerns: [] as string[],
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsSubmitting(true)

    try {
      const profileId = await addProfile({
        user: currentUser.id,
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender as "male" | "female",
        grade: formData.grade,
        main_concerns: formData.main_concerns,
        notes: formData.notes,
      } as any)

      router.push(`/dashboard/cases/${profileId}`)
    } catch (error) {
      console.error("Failed to create profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleConcern = (concern: string) => {
    setFormData((prev) => ({
      ...prev,
      main_concerns: prev.main_concerns.includes(concern)
        ? prev.main_concerns.filter((c) => c !== concern)
        : [...prev.main_concerns, concern],
    }))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Create New Case</h1>
        <p className="text-muted-foreground">Fill in the case details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Child Information</CardTitle>
            <CardDescription>Basic details about the child</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Child Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) =>
                  setFormData({ ...formData, grade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Main concerns and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Main Concerns</Label>
              <div className="flex flex-wrap gap-2">
                {CONCERNS.map((concern) => (
                  <Button
                    key={concern}
                    type="button"
                    variant={
                      formData.main_concerns.includes(concern)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleConcern(concern)}
                  >
                    {concern}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Case"}
          </Button>
        </div>
      </form>
    </div>
  )
}
