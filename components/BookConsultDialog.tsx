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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import { PORTALS } from "@/lib/portals"
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

import { Resend } from "resend";
    

export function BookConsultDialog({ open, onOpenChange }: Props) {

  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [consultType, setConsultType] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPortal, setSelectedPortal] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [portalOtherText, setPortalOtherText] = useState("")
  const [serviceOtherText, setServiceOtherText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const selectedPortalData = PORTALS.find((p) => p.id === selectedPortal)
  const allServices = PORTALS.flatMap((p) => p.services)
  const resend = new Resend('re_gHYKBGqf_H2LVVJDcaEDVcsFMEa8UF8y8')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const { data } = await resend.emails.send({
      from: 'admin@dsc.ac',
      to: 'put_mail_here',
      subject: `Query from: ${name}`,
      text: 'it works!',
    });

    console.log(data)
    setSubmitting(false);

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
      setSelectedPortal("")
      setSelectedService("")
      setPortalOtherText("")
      setServiceOtherText("")
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
              <label className="mb-1 block text-sm font-medium">Portal</label>
              <Select
                value={selectedPortal}
                onValueChange={(val) => {
                  setSelectedPortal(val)
                  setSelectedService("")
                  setServiceOtherText("")
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a portal" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="w-[var(--radix-select-trigger-width)] max-h-[200px]"
                >
                  {PORTALS.map((portal) => (
                    <SelectItem key={portal.id} value={portal.id}>
                      {portal.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {selectedPortal === "other" && (
                <Input
                  value={portalOtherText}
                  onChange={(e) => setPortalOtherText(e.target.value)}
                  placeholder="Specify portal"
                  className="mt-2"
                />
              )}
            </div>

            {selectedPortal && (
              <div>
                <label className="mb-1 block text-sm font-medium">Service</label>
                <Select
                  value={selectedService}
                  onValueChange={(val) => {
                    setSelectedService(val)
                    setServiceOtherText("")
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="w-[var(--radix-select-trigger-width)] max-h-[200px] [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden"
                  >
                    {(selectedPortal === "other"
                      ? allServices
                      : selectedPortalData?.services ?? []
                    ).map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name.en}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {selectedService === "other" && (
                  <Input
                    value={serviceOtherText}
                    onChange={(e) => setServiceOtherText(e.target.value)}
                    placeholder="Specify service"
                    className="mt-2"
                  />
                )}
              </div>
            )}

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
