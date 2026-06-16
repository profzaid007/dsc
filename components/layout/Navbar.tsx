"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogIn, Menu, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { useAuth } from "@/hooks/useAuth"
import { getPortalById } from "@/lib/portals"
import Image from "next/image"
import { cn } from "@/lib/utils"

const DEFAULT_SIDEBAR_ITEMS = [
  { en: "Home", ar: "الرئيسية", href: "/" },
  { en: "About Us", ar: "من نحن", href: "/about-us" },
  { en: "Services", ar: "خدماتنا", href: "/" },
  { en: "Resources", ar: "الموارد", href: "/" },
  { en: "Blog", ar: "المدونة", href: "/blog" },
  { en: "Contact Us", ar: "اتصل بنا", href: "/contact-us" }
]

export function Navbar() {
  const pathname = usePathname()
  const { lang, toggleLang } = useLang()
  const { isAuthenticated, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isHome = pathname === "/"
  const isPortal = pathname.startsWith("/portal/")
  const isAppRoute = pathname.startsWith("/dashboard") || pathname === "/login"

  const portalId = isPortal ? pathname.split("/portal/")[1] : null
  const portal = portalId ? getPortalById(portalId) : null

  const logoBg = portal?.accent ?? (isHome ? "#d4af37" : "#d4af37")
  const logoGradient = "radial-gradient(circle, #d4af37 0%, #aa7c11 100%)"

  const headerText = portal ? t(portal.portalName, lang) : "DSC"
  const subheading = portal
    ? t(portal.tagline, lang)
    : t({ en: "Development Secrets Consultancy", ar: "استشارية أسرار التطور" }, lang)

  const accentColor = portal?.accent ?? "#0b1a30"

  const showSidebar = isHome

  return (
    <div className="w-full">
      {/* Main Navbar */}
      <header
        className="border-b bg-white px-4 sm:px-6 lg:px-10"
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between py-4">
          {/* Left: Logo + Hamburger (mobile) */}
          <div className="flex items-center gap-4">
            {showSidebar && (
              <button
                className="mr-2 rounded-md p-1.5 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}

            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-[60px] w-[60px] items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="DSC Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1
                  className="text-[1.8rem] font-bold"
                  style={{ color: accentColor }}
                >
                  {headerText}
                </h1>
                <p className="text-sm font-semibold text-[#0076a3]">
                  {subheading}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Language + Auth */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="text-base font-bold transition-colors hover:text-[#0076a3]"
              style={{ color: accentColor }}
            >
              {t({ en: "العربية", ar: "English" }, lang)}
            </button>

            {!isAuthenticated && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden gap-2 sm:inline-flex"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
                </Link>
              </Button>
            )}

            {isAuthenticated && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden gap-2 sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  {t({ en: "Dashboard", ar: "لوحة التحكم" }, lang)}
                </Link>
              </Button>
            )}

            {isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden gap-2 sm:inline-flex"
              >
                <Link href="/cms">
                  <FileText className="h-4 w-4" />
                  {t({ en: "Manage Pages", ar: "إدارة الصفحات" }, lang)}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop (horizontal) */}
      {showSidebar && (
        <nav
          className="hidden border-b md:block"
          style={{ backgroundColor: `${accentColor}08`, borderColor: `${accentColor}15` }}
        >
          <div className="mx-auto flex max-w-[1400px] gap-4 justify-between px-4 sm:px-6 lg:px-10">
            {DEFAULT_SIDEBAR_ITEMS.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                style={{ borderBottom: "2px solid transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                {t({ en: item.en, ar: item.ar }, lang)}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Sidebar - Mobile (collapsible) */}
      {showSidebar && mobileMenuOpen && (
        <nav
          className="border-b md:hidden"
          style={{ backgroundColor: `${accentColor}08`, borderColor: `${accentColor}15` }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {DEFAULT_SIDEBAR_ITEMS.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t({ en: item.en, ar: item.ar }, lang)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
