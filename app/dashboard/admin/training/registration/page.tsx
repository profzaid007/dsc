"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Registration = {
  id: number
  participant: string
  program: string
  regDate: string
  status: string
}

const registrationsData: Registration[] = [
  { id: 1, participant: "Youssef Ahmed", program: "Leadership Fundamentals", regDate: "2024-04-10", status: "Confirmed" },
  { id: 2, participant: "Leila Salem", program: "Data Analysis Workshop", regDate: "2024-04-12", status: "Pending" },
  { id: 3, participant: "Tariq Ibrahim", program: "Safety Compliance", regDate: "2024-04-14", status: "Confirmed" },
]

export default function RegistrationPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRegistrations = registrationsData.filter((r) =>
    r.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.program.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Registration Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>{reg.id}</TableCell>
                  <TableCell>{reg.participant}</TableCell>
                  <TableCell>{reg.program}</TableCell>
                  <TableCell>{reg.regDate}</TableCell>
                  <TableCell>
                    <Badge variant={reg.status === "Confirmed" ? "default" : "secondary"}>
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
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