"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  leader: string
  members: number
  nextMeeting: string
}

const committeesData: Committee[] = [
  { id: 1, name: "Strategic Planning Committee", type: "Committee", leader: "Ahmed Al-Rashid", members: 4, nextMeeting: "2024-05-01" },
  { id: 2, name: "Finance Committee", type: "Committee", leader: "Sarah Johnson", members: 3, nextMeeting: "2024-05-05" },
  { id: 3, name: "IT Steering Committee", type: "Committee", leader: "Omar Khalil", members: 4, nextMeeting: "2024-05-10" },
  { id: 4, name: "HR Advisory Committee", type: "Counsel", leader: "Sara Ahmed", members: 3, nextMeeting: "2024-05-12" },
]

export default function CommitteesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Committee Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Total Committees</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">45</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Meetings This Month</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">28</div>
              <div className="text-sm text-muted-foreground">Pending Tasks</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Committees Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Committee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Next Meeting</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committeesData.map((committee) => (
                <TableRow key={committee.id}>
                  <TableCell className="font-medium">{committee.name}</TableCell>
                  <TableCell><Badge variant="secondary">{committee.type}</Badge></TableCell>
                  <TableCell>{committee.leader}</TableCell>
                  <TableCell>{committee.members} members</TableCell>
                  <TableCell>{committee.nextMeeting}</TableCell>
                  <TableCell><Badge variant="default" className="bg-green-500">Active</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2024-04-28</TableCell>
                <TableCell>Meeting scheduled</TableCell>
                <TableCell>Strategic Planning</TableCell>
                <TableCell>Ahmed Al-Rashid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-04-27</TableCell>
                <TableCell>New member added</TableCell>
                <TableCell>Finance Committee</TableCell>
                <TableCell>Sarah Johnson</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-04-26</TableCell>
                <TableCell>Task completed</TableCell>
                <TableCell>IT Steering</TableCell>
                <TableCell>Omar Khalil</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}