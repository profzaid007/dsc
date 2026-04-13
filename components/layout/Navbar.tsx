"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/form/LanguageToggle";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { SITE_CONTENT } from "@/lib/site-content";
import { cn } from "@/lib/utils";

import Image from "next/image";
import { LogIn } from "lucide-react";

export function Navbar() {
  const { lang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close services dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);


  const navLinkClass =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">

        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="DSC Logo"
            width={150}
            height={60}
            className="h-15 w-auto"  // or any size you prefer
            unoptimized            // required for SVGs
          />
        </Link>

        {/* Logo */}
        {/* <Link 
          href="/"
          className="text-xl font-bold tracking-wide"
          style={{ color: "var(--dsc-navy)" }}
        >
          DSC
        </Link> */}

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">


          <Link
            href="/"
            className={cn(navLinkClass)}
          >
            {t(SITE_CONTENT.nav.home, lang)}
          </Link>

          <Link
            href="/#about"
            className={cn(navLinkClass)}
          >
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
                  servicesOpen && "rotate-180",
                )}
              />
            </button>

            {servicesOpen && (
              <div className="animate-in fade-in slide-in-from-top-1 absolute start-0 top-full z-50 mt-2 w-52 rounded-lg border bg-background py-1 shadow-lg duration-150">
                <Link
                  href="/#services"
                  className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setServicesOpen(false)}
                >
                  {t(SITE_CONTENT.nav.individualServices, lang)}
                </Link>
                <Link
                  href="/#services"
                  className="block px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex"
            style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
          >
            <Link href="/apply">
              {t(SITE_CONTENT.nav.bookConsultation, lang)}
            </Link>
          </Button>

          {/* Hamburger */}
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Login button */} 
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden md:inline-flex gap-2"
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>

        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-in slide-in-from-top-2 border-t bg-background px-4 py-4 duration-200 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(SITE_CONTENT.nav.home, lang)}
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(SITE_CONTENT.nav.aboutUs, lang)}
            </Link>
            <div className="px-3 py-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {t(SITE_CONTENT.nav.services, lang)}
              </p>
              <div className="ms-2 flex flex-col gap-1">
                <Link
                  href="/#services"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t(SITE_CONTENT.nav.individualServices, lang)}
                </Link>
                <Link
                  href="/#services"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t(SITE_CONTENT.nav.institutionalServices, lang)}
                </Link>
              </div>
            </div>
            <Link
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(SITE_CONTENT.nav.contactUs, lang)}
            </Link>

            <div className="mt-2 border-t pt-2">
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
  );
}
