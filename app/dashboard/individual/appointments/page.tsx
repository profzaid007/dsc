import { LocalizedText } from "@/components/LocalizedText"
export default function AppointmentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold"><LocalizedText text={"Appointments"} /></h1>
      <p className="text-muted-foreground"><LocalizedText text={"Coming soon."} /></p>
    </div>
  )
}
