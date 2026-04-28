"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Certificate = {
  id: number
  studentName: string
  programName: string
  issueDate: string
  certificateNumber: string
}

const initialCertificates: Certificate[] = [
  { id: 1, studentName: "Ahmed Mohamed", programName: "Leadership Fundamentals", issueDate: "2024-03-15", certificateNumber: "CERT-001234" },
  { id: 2, studentName: "Fatima Ali", programName: "Data Analysis Workshop", issueDate: "2024-03-20", certificateNumber: "CERT-001235" },
  { id: 3, studentName: "Omar Hassan", programName: "Effective Communication", issueDate: "2024-04-01", certificateNumber: "CERT-001236" },
]

export default function CertificatesPage() {
  const [certificates] = useState<Certificate[]>(initialCertificates)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCertificates = certificates.filter((c) =>
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.programName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Certificates</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-md border">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between border-b p-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{cert.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.programName} | {cert.certificateNumber}
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
            <CardTitle>Add Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input id="studentName" placeholder="Enter student name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programName">Program *</Label>
                <Input id="programName" placeholder="Program name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input id="certificateNumber" placeholder="Certificate number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes" rows={2} />
              </div>

              <Button type="submit">Add Certificate</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}