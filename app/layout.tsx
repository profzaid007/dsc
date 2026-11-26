import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google"
import { localizedPath, isArticlePath } from "@/lib/locale-routing"
import { cookies, headers } from "next/headers"

import "./globals.css"
import "react-datepicker/dist/react-datepicker.css"
import { getPublicPortals } from "@/lib/public-portals"
import { AppShell } from "@/components/AppShell"
import { getPageTitle } from "@/lib/page-seo"
import { SITE_URL } from "@/lib/seo"
import { cn } from "@/lib/utils"

export async function generateMetadata() {
  const lang = (await cookies()).get("lang")?.value
  const path = (await headers()).get("x-public-path")
  const language = lang === "ar" ? "ar" : "en"
  return {
    ...(path ? {
      alternates: {
        canonical: `${SITE_URL}${isArticlePath(path) ? path : localizedPath(path, language)}`,
        // An article is one authored record, not a pair of translated pages.
        ...(!isArticlePath(path) ? { languages: {
          ar: `${SITE_URL}${localizedPath(path, "ar")}`,
          en: `${SITE_URL}${localizedPath(path, "en")}`,
        } } : {}),
      },
    } : {}),
    metadataBase: new URL(SITE_URL),
    title: {
      default: path ? await getPageTitle(path) : (language === "ar" ? "استشارية أسرار التطور | DSC" : "Development Secrets Consultancy | DSC"),
      template: "%s | DSC",
    },
  }
}

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-fallback",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publicPortals = await getPublicPortals()
  const cookieStore = await cookies()
  const initialLang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en"

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        arabic.variable
      )}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>

      <body>
        <AppShell initialLang={initialLang} publicPortals={publicPortals}>{children}</AppShell>
      </body>
    </html>
  )
}
