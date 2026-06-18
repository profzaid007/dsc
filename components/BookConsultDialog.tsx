"use client"

import { useState, type FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Loader2 } from "lucide-react"
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookConsultDialog({ open, onOpenChange }: Props) {

  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [consultType, setConsultType] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    // Send email here 
    
  }

  function handleClose() {
    onOpenChange(false)
    // reset after dialog closes
    setTimeout(() => {
      setName("")
      setContact("")
      setEmail("")
      setConsultType("")
      setDescription("")
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
            Book a Consultation
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

            <div>
              <label className="mb-1 block text-sm font-medium">
                Consultation Type
              </label>
              <Input
                required
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                placeholder="e.g. Individual, Corporate, Career, etc."
              />
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
