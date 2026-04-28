"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Session = {
  id: number
  topic: string
  category: string
  audience: string
  timeFrom: string
  timeTo: string
  speaker: string
  coordinator: string
}

const initialSessions: Session[] = [
  { id: 1, topic: "New Employee Orientation", category: "Orientation", audience: "New Hires", timeFrom: "09:00", timeTo: "12:00", speaker: "HR Director", coordinator: "Maya Sami" },
  { id: 2, topic: "Workplace Safety Awareness", category: "Safety", audience: "All Staff", timeFrom: "14:00", timeTo: "16:00", speaker: "Safety Officer", coordinator: "Khaled Mansour" },
  { id: 3, topic: "Cybersecurity Best Practices", category: "Security", audience: "Managers", timeFrom: "10:00", timeTo: "11:30", speaker: "IT Manager", coordinator: "Rana Ali" },
]

export default function AwarenessSessionsPage() {
  const [sessions] = useState<Session[]>(initialSessions)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSessions = sessions.filter((s) =>
    s.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Awareness Sessions</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border-b p-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{session.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.category} | {session.timeFrom} - {session.timeTo}
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
            <CardTitle>Add/Edit Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input id="topic" placeholder="Session topic" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orientation">Orientation</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      <SelectItem value="managers">Managers</SelectItem>
                      <SelectItem value="new-hires">New Hires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeFrom">Time From</Label>
                  <Input id="timeFrom" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeTo">Time To</Label>
                  <Input id="timeTo" type="time" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker</Label>
                  <Input id="speaker" placeholder="Speaker name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinator">Coordinator</Label>
                  <Input id="coordinator" placeholder="Coordinator name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Location" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes" rows={2} />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Session</Button>
                <Button type="button" variant="outline">Recurring Schedule</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}