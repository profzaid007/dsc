"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Meeting = {
  id: number
  committee: string
  date: string
  time: string
  present: string
  absent: string
  notes: string
}

const meetingsData: Meeting[] = [
  { id: 1, committee: "Strategic Planning Committee", date: "2024-04-25", time: "10:00", present: "Ahmed Al-Rashid, Fatima Hassan", absent: "Omar Khalil", notes: "Q1 review completed" },
  { id: 2, committee: "Finance Committee", date: "2024-04-20", time: "14:00", present: "Sarah Johnson, Mark Chen", absent: "Lisa Moore", notes: "Budget approval" },
  { id: 3, committee: "IT Steering Committee", date: "2024-04-22", time: "11:00", present: "Omar Khalil, James Wilson", absent: "", notes: "Infrastructure upgrade plan" },
]

const attendees = [
  { name: "Ahmed Al-Rashid" },
  { name: "Fatima Hassan" },
  { name: "Omar Khalil" },
  { name: "Sara Ahmed" },
]

export default function MeetingsPage() {
  const [meetings] = useState<Meeting[]>(meetingsData)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Meeting Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule New Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="committee">Committee *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select committee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">Strategic Planning Committee</SelectItem>
                    <SelectItem value="c2">Finance Committee</SelectItem>
                    <SelectItem value="c3">IT Steering Committee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingTitle">Meeting Title</Label>
                <Input id="meetingTitle" placeholder="Optional title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attendance</Label>
              <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
                {attendees.map((attendee) => (
                  <div key={attendee.name} className="flex items-center justify-between py-2">
                    <span className="text-sm">{attendee.name}</span>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present (حاضر)</SelectItem>
                        <SelectItem value="absent">Absent (اعتذار)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Meeting Notes</Label>
              <Textarea id="notes" placeholder="Agenda items, decisions, action items..." rows={4} />
            </div>

            <Button type="submit">Schedule Meeting</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Committee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.committee}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>{meeting.time}</TableCell>
                  <TableCell>{meeting.present || "-"}</TableCell>
                  <TableCell>{meeting.absent || "-"}</TableCell>
                  <TableCell>{meeting.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
