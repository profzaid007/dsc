"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import {
  PortalServiceSelector,
  type PortalServiceValue,
} from "@/components/register/PortalServiceSelector"
import { getPortalById } from "@/lib/portals"
import { formatDate } from "@/lib/format-date"
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookConsultDialog({ open, onOpenChange }: Props) {

  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [description, setDescription] = useState("")
  const [consultationType, setConsultationType] = useState<"online" | "face-to-face" | "">("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [portalService, setPortalService] = useState<PortalServiceValue>({
    categoryId: "",
    subCategoryId: "",
    customCategory: "",
    customSubCategory: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")


    try {
      const { categoryId, subCategoryId, customCategory, customSubCategory } = portalService

      const portal = getPortalById(categoryId)
      const service = portal?.services.find((s) => s.id === subCategoryId)

      const issueType = customCategory || portal?.title || ""
      const caseType = customSubCategory || service?.name.en || ""

      const html = [
        "<h2>New Consultation Request</h2>",
        `<p><strong>Name:</strong> ${name}</p>`,
        `<p><strong>Contact:</strong> ${contact}</p>`,
        `<p><strong>Email:</strong> ${email}</p>`,
        issueType ? `<p><strong>Issue Type:</strong> ${issueType}</p>` : "",
        caseType ? `<p><strong>Case Type:</strong> ${caseType}</p>` : "",
        consultationType ? `<p><strong>Consultation Type:</strong> ${consultationType === "online" ? "Online" : "Face to Face"}</p>` : "",
        preferredDate ? `<p><strong>Preferred Date:</strong> ${formatDate(preferredDate)}</p>` : "",
        preferredTime ? `<p><strong>Preferred Time:</strong> ${preferredTime}</p>` : "",
        description ? `<p><strong>Description:</strong><br/>${description}</p>` : "",
      ].join("\n")

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "admin@dsc.ac",
          to: email,
          cc: "consult@dsc.ac",
          subject: `Consultation request from: ${name}`,
          html,
        }),
      })

      const message_response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${name}`,
          contact: `${contact}`,
          email: `${email}`,
          issueType: `${issueType}`,
          caseType: `${caseType}`,
          consultationType: `${consultationType}`,
          preferredDate: `${formatDate(preferredDate)}`,
          preferredTime: `${preferredTime}`,
          description: `${description}`,
        }),
      })

      if (!response.ok || !message_response.ok) {
        const { error: errMsg } = await response.json()
        throw new Error(errMsg || "Failed to send request")
      }

      setDone(true)
      router.push("https://wa.me/message/XGN76UVRTVL7C1")

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    onOpenChange(false)
    // reset after dialog closes
    setTimeout(() => {
      setName("")
      setContact("")
      setEmail("")
      setDescription("")
      setConsultationType("")
      setPreferredDate("")
      setPreferredTime("")
      setPortalService({
        categoryId: "",
        subCategoryId: "",
        customCategory: "",
        customSubCategory: "",
      })
      setDone(false)
      setError("")
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book Consult
          </DialogTitle>

          <DialogDescription>
            Fill in your details and we'll get back to you.
          </DialogDescription>

        </DialogHeader>
        {done ? (
          <div className="py-6 text-center text-sm text-green-600">
            Your consultation request has been sent successfully! We'll
            contact you within 48 hours.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contact</label>
              <Input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <PortalServiceSelector
              value={portalService}
              onChange={setPortalService}
              required
            />

            <div className="space-y-3">
              <p className="text-sm font-medium">Consultation Preferences</p>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Type
                </Label>
                <Select
                  value={consultationType}
                  onValueChange={(v: "online" | "face-to-face") => setConsultationType(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="face-to-face">Face to Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Preferred Date
                </Label>
                <DateInput
                  value={preferredDate}
                  onChange={setPreferredDate}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  Preferred Time
                </Label>
                <Input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what you need help with"
                rows={4}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
