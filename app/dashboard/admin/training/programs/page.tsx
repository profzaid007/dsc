"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Program = {
  id: number
  name: string
  category: string
  days: number
  trainer: string
  coordinator: string
  type: string
  location: string
}

const initialPrograms: Program[] = [
  { id: 1, name: "Leadership Fundamentals", category: "Leadership", days: 5, trainer: "Dr. Sarah Johnson", coordinator: "Ahmed Al-Rashid", type: "In-Person", location: "Training Room A" },
  { id: 2, name: "Data Analysis Workshop", category: "Technical", days: 3, trainer: "Mark Chen", coordinator: "Fatima Hassan", type: "Online", location: "Virtual" },
  { id: 3, name: "Effective Communication", category: "Soft Skills", days: 2, trainer: "Lisa Moore", coordinator: "Omar Khalil", type: "In-Person", location: "Conference Hall" },
  { id: 4, name: "Safety Compliance Training", category: "Compliance", days: 1, trainer: "James Wilson", coordinator: "Sara Ahmed", type: "Hybrid", location: "Main Office" },
]

export default function TrainingProgramsPage() {
  const [programs] = useState<Program[]>(initialPrograms)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Training Programs</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Programs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between border-b p-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {program.category} | {program.days} days | {program.type}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add/Edit Program</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name *</Label>
                <Input id="name" placeholder="Enter program name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="soft-skills">Soft Skills</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Duration (Days) *</Label>
                  <Input id="days" type="number" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainer">Trainer</Label>
                <Input id="trainer" placeholder="Trainer name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordinator">Coordinator *</Label>
                <Input id="coordinator" placeholder="Coordinator name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Location" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Goals/Objectives</Label>
                <Textarea id="goals" placeholder="Describe program goals" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes" rows={2} />
              </div>

              <Button type="submit">Add Program</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}