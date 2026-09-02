"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, LayoutDashboard, LogIn, Menu, X, FileText, UserPlus, User, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { useAuth } from "@/hooks/useAuth"
import { getPortalById } from "@/lib/portals"
import { SITE_CONTENT } from "@/lib/site-content"
import Image from "next/image"
import { BookConsultDialog } from "../BookConsultDialog"

const NAV_LINKS = [
  { en: "Home", ar: "الرئيسية", href: "/" },
  { en: "About Us", ar: "من نحن", href: "/about-us" },
  { en: "Blog", ar: "المدونة", href: "/blog" },
  { en: "Training and Courses", ar: "الدورات والبرامج", href: "/programmes" },
  { en: "Contact Us", ar: "اتصل بنا", href: "/contact-us" }
]

export function Navbar() {
  const pathname = usePathname()
  const { lang, toggleLang } = useLang()
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const accountRef = useRef<HTMLDivElement>(null)

  const isHome = pathname === "/"
  const isPortal = pathname.startsWith("/portal/")
  const isAppRoute = pathname.startsWith("/dashboard") || pathname === "/login"

  const portalId = isPortal ? pathname.split("/portal/")[1] : null
  const portal = portalId ? getPortalById(portalId) : null

  const [consultOpen, setConsultOpen] = useState(false)
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)

  useEffect(() => {
    if (!accountPopoverOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountPopoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [accountPopoverOpen])

  const headerText = portal ? t(portal.portalName, lang) : "DSC"
  const subheading = portal
    ? t(portal.tagline, lang)
    : t({ en: "Development Secrets Consultancy", ar: "استشارية أسرار التطور" }, lang)

  const accentColor = portal?.accent ?? "#0b1a30"

  return (
    <div className="w-full">
      <header className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 py-4">
          {/* Left: Logo + Hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {!isAppRoute && (
              <button
                className="rounded-md p-1.5 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
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

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-[56px] w-[56px] items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="DSC Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1
                  className="text-xl font-bold leading-tight"
                  style={{ color: accentColor }}
                >
                  {headerText}
                </h1>
                <p className="text-[13px] font-semibold text-[#0076a3] leading-tight">
                  {subheading}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Nav links (desktop) */}
          {!isAppRoute && (
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((item, i) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-[#0a3d62]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#0a3d62]"
                    }`}
                  >
                    {t({ en: item.en, ar: item.ar }, lang)}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right: Language + Auth + Consult */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="rounded-md px-2 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0076a3]"
            >
              {t({ en: "العربية", ar: "English" }, lang)}
            </button>

            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0a3d62] md:flex"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
                </Link>
                <Link
                  href="/register"
                  className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0a3d62] md:flex"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {t({ en: "Create Account", ar: "إنشاء حساب" }, lang)}
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setAccountPopoverOpen(!accountPopoverOpen)}
                  className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="font-medium truncate max-w-[120px]">
                    {currentUser?.name || ""}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {accountPopoverOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white shadow-lg z-50 py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountPopoverOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t({ en: "Dashboard", ar: "لوحة التحكم" }, lang)}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/cms"
                        onClick={() => setAccountPopoverOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        {t({ en: "Manage Pages", ar: "إدارة الصفحات" }, lang)}
                      </Link>
                    )}
                    <div className="my-1 border-t" />
                    <button
                      onClick={() => {
                        setAccountPopoverOpen(false)
                        logout()
                        router.push("/")
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      {t({ en: "Logout", ar: "تسجيل الخروج" }, lang)}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <Button
                variant="default"
                size="sm"
                className="hidden gap-2 md:flex"
                onClick={() => setConsultOpen(true)}
              >
                <Calendar className="h-4 w-4" />
                {t(SITE_CONTENT.nav.bookConsultation, lang)}
              </Button>
            )}

            <BookConsultDialog open={consultOpen} onOpenChange={setConsultOpen} />
          </div>
        </div>
      </header>

      {/* Mobile menu (dropdown) */}
      {!isAppRoute && mobileMenuOpen && (
        <nav className="border-b border-gray-200 bg-white md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((item, i) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-[#0a3d62]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t({ en: item.en, ar: item.ar }, lang)}
                </Link>
              )
            })}

            <div className="my-2 border-t border-gray-100" />

            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  {t({ en: "Create Account", ar: "إنشاء حساب" }, lang)}
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="font-medium truncate">
                  {currentUser?.name || ""}
                </span>
              </div>
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

            {isAuthenticated && (
              <>
                <div className="my-1 border-t" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                    router.push("/")
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  {t({ en: "Logout", ar: "تسجيل الخروج" }, lang)}
                </button>
              </>
            )}

            <Button
              variant="default"
              size="sm"
              className="gap-2 justify-start mt-1"
              onClick={() => {
                setMobileMenuOpen(false)
                setConsultOpen(true)
              }}
            >
              <Calendar className="h-4 w-4" />
              {t(SITE_CONTENT.nav.bookConsultation, lang)}
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}
