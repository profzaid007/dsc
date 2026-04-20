"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, LayoutDashboard, Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/form/LanguageToggle"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import { SITE_CONTENT } from "@/lib/site-content"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"

export function Navbar() {
  const { lang } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const navLinkClass =
    "text-sm font-medium text-gray-700 transition-all duration-200 hover:text-[#0A3D62] hover:underline decoration-2 underline-offset-4"

  return (
    <nav className="top-5 mt-5 z-50 mx-auto w-full max-w-[1400px] rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-md">
      {/* GRID WRAPPER */}
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-8">
        {/* LEFT: Logo */}
        <div className="flex-shrink-0 mr-70">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="DSC Logo"
              width={150}
              height={60}
              className="h-15 w-auto"
              unoptimized
            />
          </Link>
        </div>

        {/* CENTER: Nav Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className={cn(navLinkClass)}>
            {t(SITE_CONTENT.nav.home, lang)}
          </Link>

          <Link href="/#about" className={cn(navLinkClass)}>
            {t(SITE_CONTENT.nav.aboutUs, lang)}
          </Link>

          {/* Services dropdown */}
          <div ref={servicesRef} className="relative">
            <button
              className={cn(navLinkClass, "flex items-center gap-1")}
              onClick={() => setServicesOpen((o) => !o)}
              aria-expanded={servicesOpen}
            >
              {t(SITE_CONTENT.nav.services, lang)}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  servicesOpen && "rotate-180"
                )}
              />
            </button>

            {servicesOpen && (
              <div className="absolute start-0 top-full z-50 mt-2 w-52 animate-in rounded-lg border border-gray-200 bg-white py-1 shadow-xl duration-150 fade-in slide-in-from-top-1">
                <Link
                  href="/#services"
                  className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#0A3D62]"
                  onClick={() => setServicesOpen(false)}
                >
                  {t(SITE_CONTENT.nav.individualServices, lang)}
                </Link>
                <Link
                  href="/#services"
                  className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#0A3D62]"
                  onClick={() => setServicesOpen(false)}
                >
                  {t(SITE_CONTENT.nav.institutionalServices, lang)}
                </Link>
              </div>
            )}
          </div>

          <Link href="/#contact" className={cn(navLinkClass)}>
            {t(SITE_CONTENT.nav.contactUs, lang)}
          </Link>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-2 justify-self-end ml-20">
          <LanguageToggle />

          <Button
            asChild
            size="sm"
            className="hidden shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-yellow-600/20 md:inline-flex"
            style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
          >
            <Link href="/apply">
              {t(SITE_CONTENT.nav.bookConsultation, lang)}
            </Link>
          </Button>

          {/* Hamburger */}
          <button
            className="rounded-md p-1.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-[#0A3D62] md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Auth buttons */}
          {!isAuthenticated && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-2 md:inline-flex"
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}

          {isAuthenticated && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-2 md:inline-flex"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-in border-t border-gray-200 bg-white px-4 py-4 duration-200 slide-in-from-top-2 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0A3D62]"
            >
              {t(SITE_CONTENT.nav.home, lang)}
            </Link>

            <Link
              href="/#about"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0A3D62]"
            >
              {t(SITE_CONTENT.nav.aboutUs, lang)}
            </Link>

            <div className="px-3 py-2">
              <p className="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                {t(SITE_CONTENT.nav.services, lang)}
              </p>
              <div className="ms-2 flex flex-col gap-1">
                <Link
                  href="/#services"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0A3D62]"
                >
                  {t(SITE_CONTENT.nav.individualServices, lang)}
                </Link>
                <Link
                  href="/#services"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0A3D62]"
                >
                  {t(SITE_CONTENT.nav.institutionalServices, lang)}
                </Link>
              </div>
            </div>

            <Link
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0A3D62]"
            >
              {t(SITE_CONTENT.nav.contactUs, lang)}
            </Link>

            <div className="mt-2 border-t border-gray-200 pt-2">
              <Button
                asChild
                className="w-full"
                style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
              >
                <Link href="/apply">
                  {t(SITE_CONTENT.nav.bookConsultation, lang)}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
