import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/cms", "/api", "/config-preview"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
