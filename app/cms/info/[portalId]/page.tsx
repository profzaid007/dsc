"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getPortalById, PORTALS } from "@/lib/portals"
import { infoPagesCollection } from "@/lib/pb-collections"
import type { InfoPage } from "@/types/cms"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { icons } from "lucide-react"
import { ArrowLeft } from "lucide-react"

interface ServiceStatus {
  serviceId: string
  name: string
  icon: string
  isPublished: boolean
  exists: boolean
}

export default function CmsPortalServicesPage() {
  const params = useParams()
  const portalId = params.portalId as string
  const portal = getPortalById(portalId)

  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!portal) return

    async function loadStatuses() {
      const statuses: ServiceStatus[] = []
      for (const service of portal!.services) {
        const page = await infoPagesCollection.getBySlug(service.id)
        statuses.push({
          serviceId: service.id,
          name: service.name.en,
          icon: service.icon,
          isPublished: page?.is_published || false,
          exists: !!page,
        })
      }
      setServiceStatuses(statuses)
      setLoading(false)
    }

    loadStatuses()
  }, [portal])

  if (!portal) {
    return (
      <div className="space-y-4">
        <Link
          href="/cms/info"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p>Portal not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cms/info"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{portal.title.en}</h1>
        <p className="text-muted-foreground">
          Manage service pages for this portal
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceStatuses.map((service) => {
            const iconKey =
              service.icon.charAt(0).toUpperCase() + service.icon.slice(1)
            const Icon = icons[iconKey as keyof typeof icons]

            return (
              <Link
                key={service.serviceId}
                href={`/cms/info/${portalId}/${service.serviceId}`}
              >
                <Card className="group flex items-center gap-4 p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${portal.accent}15` }}
                  >
                    {Icon && (
                      <Icon
                        className="h-6 w-6"
                        style={{ color: portal.accent }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{service.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {service.exists ? (
                        service.isPublished ? (
                          <Badge
                            variant="default"
                            className="text-xs"
                            style={{
                              backgroundColor: portal.accent,
                              color: "#fff",
                            }}
                          >
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not created
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
