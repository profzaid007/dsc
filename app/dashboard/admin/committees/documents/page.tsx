"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Meeting Documents</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Committee</Label>
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
                <Label>Meeting Date</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m1">2024-04-25 - Strategic Planning</SelectItem>
                    <SelectItem value="m2">2024-04-20 - Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Document Title</Label>
              <Input placeholder="Document title" />
            </div>

            <div className="space-y-2">
              <Label>Upload File</Label>
              <Input type="file" />
            </div>

            <Button type="button">Upload Document</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>Meeting Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Meeting Minutes - Q1 Review</TableCell>
                <TableCell>Strategic Planning</TableCell>
                <TableCell>2024-04-25</TableCell>
                <TableCell>Ahmed Al-Rashid</TableCell>
                <TableCell>2024-04-26</TableCell>
                <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Budget Proposal FY2025</TableCell>
                <TableCell>Finance Committee</TableCell>
                <TableCell>2024-04-20</TableCell>
                <TableCell>Fatima Hassan</TableCell>
                <TableCell>2024-04-21</TableCell>
                <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>IT Infrastructure Plan</TableCell>
                <TableCell>IT Steering</TableCell>
                <TableCell>2024-04-15</TableCell>
                <TableCell>Omar Khalil</TableCell>
                <TableCell>2024-04-16</TableCell>
                <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
