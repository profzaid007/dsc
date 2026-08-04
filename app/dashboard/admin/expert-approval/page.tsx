"use client"

import { useState, useEffect } from "react"
import { useUsers } from "@/hooks/useUsers"
import pb from "@/lib/pb"
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SkeletonTable } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  UserCheck,
  Mail,
  Phone,
  CalendarClock,
  CheckCircle2,
  Paperclip,
  MessageSquareText,
  Eye,
} from "lucide-react"
import type { User } from "@/types/user"
import { formatDateTime } from "@/lib/format-date"

export default function ExpertApprovalPage() {
  const { users, isLoading, updateUser, refresh } = useUsers()
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")
  const [fileToken, setFileToken] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    let cancelled = false
    pb.files
      .getToken()
      .then((token) => {
        if (!cancelled) setFileToken(token)
      })
      .catch(() => {
        if (!cancelled) setFileToken("")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pendingExperts = users.filter(
    (u) => u.role === "expert" && !u.is_active
  )

  const getFileUrl = (user: User, filename: string) => {
    return pb.files.getURL(user, filename, fileToken ? { token: fileToken } : {})
  }

  const handleApprove = async (user: (typeof users)[number]) => {
    setApprovingId(user.id)
    setActionError("")
    try {
      await updateUser(user.id, { is_active: true })

      const loginUrl = `${window.location.origin}/login`
      const html = [
        "<h2>Your Expert Account Has Been Approved</h2>",
        `<p>Dear ${user.name},</p>`,
        `<p>Congratulations! Your expert account at <strong>DSC</strong> has been approved.</p>`,
        `<p>You can now log in using the email and password you provided at registration:</p>`,
        `<p><a href="${loginUrl}">${loginUrl}</a></p>`,
      ].join("\n")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "admin@dsc.ac",
          to: user.email,
          subject: "Your Expert Account Has Been Approved",
          html,
        }),
      })

      if (!response.ok) {
        const { error: errMsg } = await response.json()
        throw new Error(errMsg || "Failed to send approval email")
      }

      await refresh()
      setSelectedUser(null)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve. Please try again."
      )
      await refresh()
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Expert Approval</h1>
        <p className="text-muted-foreground">
          Review and approve expert applications
        </p>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : pendingExperts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No pending applications</h3>
            <p className="text-center text-muted-foreground">
              There are no expert applications waiting for approval.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Expert Applications</CardTitle>
            <CardDescription>
              {pendingExperts.length} application(s) awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingExperts.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.contact_number || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDateTime(user.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="me-1 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user)}
                          disabled={approvingId === user.id}
                        >
                          {approvingId === user.id
                            ? "Approving..."
                            : "Approve & Notify"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedUser.name}
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700"
                  >
                    Pending
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Expert application submitted on{" "}
                  {formatDateTime(selectedUser.created)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium break-all">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">
                      {selectedUser.contact_number || "—"}
                    </span>
                  </div>
                </div>

                {selectedUser.message && (
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                      <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                      Message
                    </div>
                    <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
                      {selectedUser.message}
                    </p>
                  </div>
                )}

                {selectedUser.attachments &&
                  selectedUser.attachments.length > 0 && (
                    <div>
                      <div className="mb-1 flex items-center gap-1.5 text-sm font-medium">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        Attachments
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {selectedUser.attachments.map((filename) => (
                          <a
                            key={filename}
                            href={getFileUrl(selectedUser, filename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border p-2 text-sm text-primary hover:bg-muted/50 hover:underline"
                          >
                            <Paperclip className="h-4 w-4 shrink-0" />
                            <span className="truncate">{filename}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleApprove(selectedUser)}
                  disabled={approvingId === selectedUser.id}
                >
                  {approvingId === selectedUser.id
                    ? "Approving..."
                    : "Approve & Notify"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
