"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Scheduling = {
  session: string
  date: string
  time: string
  location: string
  capacity: number
  enrolled: number
}

const schedulingData: Scheduling[] = [
  { session: "Leadership Fundamentals", date: "2024-05-01", time: "09:00 - 16:00", location: "Training Room A", capacity: 25, enrolled: 18 },
  { session: "Data Analysis Workshop", date: "2024-05-05", time: "10:00 - 13:00", location: "Virtual", capacity: 30, enrolled: 22 },
  { session: "Effective Communication", date: "2024-05-10", time: "14:00 - 17:00", location: "Conference Hall", capacity: 20, enrolled: 15 },
]

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Scheduling</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedulingData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.session}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.capacity}</TableCell>
                  <TableCell>{item.enrolled} / {item.capacity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}