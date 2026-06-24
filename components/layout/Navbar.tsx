"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, LayoutDashboard, LogIn, Menu, X, FileText, UserPlus, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { useAuth } from "@/hooks/useAuth"
import { getPortalById } from "@/lib/portals"
import Image from "next/image"
import { BookConsultDialog } from "../BookConsultDialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

  const [consultOpen, setConsultOpen] = useState(false)
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)

  const headerText = portal ? t(portal.portalName, lang) : "DSC"
  const subheading = portal
    ? t(portal.tagline, lang)
    : t({ en: "Development Secrets Consultancy", ar: "استشارية أسرار التطور" }, lang)

  const accentColor = portal?.accent ?? "#0b1a30"

  const showSidebar = !isAppRoute

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
              <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 flex"
                  >
                    <User className="h-4 w-4" />
                    {t({ en: "Account", ar: "الحساب" }, lang)}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-2">
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/login"
                      onClick={() => setAccountPopoverOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <LogIn className="h-4 w-4 text-muted-foreground" />
                      {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setAccountPopoverOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                      {t({ en: "Register", ar: "التسجيل" }, lang)}
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {isAuthenticated && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2 flex"
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
                className="gap-2 flex"
              >
                <Link href="/cms">
                  <FileText className="h-4 w-4" />
                  {t({ en: "Manage Pages", ar: "إدارة الصفحات" }, lang)}
                </Link>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              className="gap-2 flex"
              onClick={() => setConsultOpen(true)}
            >
              <Calendar className="h-4 w-4" />
              Book Consult
            </Button>

            <BookConsultDialog open={consultOpen} onOpenChange={setConsultOpen} />

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
      {mobileMenuOpen && (
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
            <div className="mt-2 border-t border-gray-200 pt-2 flex flex-col gap-2">
              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t({ en: "Register", ar: "التسجيل" }, lang)}
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2 justify-start"
                  onClick={() => setMobileMenuOpen(false)}
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
                  className="gap-2 justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/cms">
                    <FileText className="h-4 w-4" />
                    {t({ en: "Manage Pages", ar: "إدارة الصفحات" }, lang)}
                  </Link>
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className="gap-2 justify-start"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setConsultOpen(true)
                }}
              >
                <Calendar className="h-4 w-4" />
                Book Consult
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  )
}
