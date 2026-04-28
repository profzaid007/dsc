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

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Training Reports</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Total Trained</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Programs Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Avg. Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Leadership Fundamentals</TableCell>
                <TableCell>45</TableCell>
                <TableCell><Badge variant="default" className="bg-green-500">92%</Badge></TableCell>
                <TableCell>85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Data Analysis Workshop</TableCell>
                <TableCell>32</TableCell>
                <TableCell><Badge variant="default" className="bg-green-500">88%</Badge></TableCell>
                <TableCell>78%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Safety Compliance Training</TableCell>
                <TableCell>79</TableCell>
                <TableCell><Badge variant="secondary">75%</Badge></TableCell>
                <TableCell>82%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}