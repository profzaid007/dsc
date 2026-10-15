import { LocalizedText } from "@/components/LocalizedText"
export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold"><LocalizedText text={"Coming Soon"} /></h1>
      <p className="text-muted-foreground"><LocalizedText text={"This page is under development."} /></p>
    </div>
  )
}
