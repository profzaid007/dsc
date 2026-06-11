"use client"

import Link from "next/link"
import { PORTALS } from "@/lib/portals"
import { Card } from "@/components/ui/card"

export default function CmsInfoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Info Pages</h1>
        <p className="text-muted-foreground">
          Select a portal to manage its service pages
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PORTALS.map((portal) => (
          <Link key={portal.id} href={`/cms/info/${portal.id}`}>
            <Card className="group overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
              <div
                className="h-2"
                style={{ backgroundColor: portal.accent }}
              />
              <div className="p-4">
                <h3 className="font-semibold">{portal.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {portal.services.length} services
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
