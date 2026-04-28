"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Committee = {
  id: number
  name: string
  type: string
  description: string
  period: string
  permissions: string
  leader: string
  members: string[]
}

const committeesData: Committee[] = [
  { id: 1, name: "Strategic Planning Committee", type: "Committee", description: "Long-term strategic planning", period: "2024-01-01 - 2024-12-31", permissions: "Full Access", leader: "Ahmed Al-Rashid", members: ["Fatima Hassan", "Omar Khalil", "Sara Ahmed"] },
  { id: 2, name: "Finance Committee", type: "Committee", description: "Financial oversight", period: "2024-01-01 - 2024-12-31", permissions: "Read/Write", leader: "Sarah Johnson", members: ["Mark Chen", "Lisa Moore"] },
  { id: 3, name: "IT Steering Committee", type: "Committee", description: "Technology strategy", period: "2024-03-01 - 2025-02-28", permissions: "Full Access", leader: "Omar Khalil", members: ["James Wilson", "Anna Lee"] },
]

export default function CommitteeManagementPage() {
  const [committees] = useState<Committee[]>(committeesData)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Committee Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Committee</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Committee Name *</Label>
                <Input id="name" placeholder="Enter committee name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="committee">Committee</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="counsel">Counsel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Objectives/Description *</Label>
              <Textarea id="description" placeholder="Describe committee objectives" rows={3} required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permissions">Permissions</Label>
                <Input id="permissions" placeholder="e.g., Read, Write" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leader">Committee Leader *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u1">Ahmed Al-Rashid</SelectItem>
                    <SelectItem value="u2">Fatima Hassan</SelectItem>
                    <SelectItem value="u3">Omar Khalil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="members">Members</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u1">Ahmed Al-Rashid</SelectItem>
                    <SelectItem value="u2">Fatima Hassan</SelectItem>
                    <SelectItem value="u3">Omar Khalil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit">Add Committee</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Committees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committees.map((committee) => (
                <TableRow key={committee.id}>
                  <TableCell className="font-medium">{committee.name}</TableCell>
                  <TableCell>{committee.period}</TableCell>
                  <TableCell><Badge variant="secondary">{committee.type}</Badge></TableCell>
                  <TableCell>{committee.leader}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {committee.members.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
