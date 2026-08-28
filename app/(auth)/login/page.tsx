"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  handlePocketBaseError,
  requestPasswordReset,
} from "@/lib/pb"

function ExpertPendingNotice() {
  const searchParams = useSearchParams()
  if (searchParams.get("expert_pending") !== "1") return null
  const emailWarn = searchParams.get("warn") === "1"
  return (
    <>
      <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
        Your application has been submitted. You will receive an email once your
        account is approved.
      </div>
      {emailWarn && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Your application was saved, but we couldn&apos;t send the notification
          email. Our team will still review your application.
        </div>
      )}
    </>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { lang } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setIsLoading(true)
    setError("")

    const result = await login(email.toLowerCase(), password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Invalid credentials")
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      setResetError("Please enter your email")
      return
    }

    setResetLoading(true)
    setResetError("")

    try {
      await requestPasswordReset(resetEmail)
      setResetSent(true)
    } catch (err: unknown) {
      const status = (err as { status?: number } | null)?.status
      if (status === 429) {
        setResetError("Too many attempts. Please try again later.")
      } else {
        setResetError(handlePocketBaseError(err))
      }
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-[#e6c200]/20 blur-3xl" />
        <div className="animate-float delay-500 absolute right-[6%] top-[24%] h-48 w-48 rounded-full bg-[#0a3d62]/15 blur-3xl" />
        <div className="absolute bottom-[12%] left-[30%] h-40 w-40 rounded-full bg-[#438b70]/15 blur-3xl" />
        <div className="animate-float delay-700 absolute right-[12%] bottom-[20%] h-8 w-8 rounded-full border border-[#c9a227]/30 bg-[#e6c200]/10" />
        <div className="animate-float delay-300 absolute left-[15%] bottom-[30%] h-6 w-6 rounded-full border border-[#0a3d62]/20 bg-white" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-24 items-stretch">
        <div className="lg:col-span-4 hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center lg:sticky lg:top-10">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="animate-pulse-ring absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-[#c9a227]/40" />
              <div className="animate-pulse-ring-delayed absolute left-1/2 top-1/2 h-28 w-28 rounded-full border border-[#e6c200]/30" />
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-white/70 shadow-lg backdrop-blur-sm">
                <Image
                  src="/logo.svg"
                  alt="DSC Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="max-w-[220px] text-sm text-muted-foreground">
              {t(
                {
                  en: "Your data is safe and secure with us",
                  ar: "بياناتك آمنة ومحمية معنا",
                },
                lang
              )}
            </p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Card className="w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-xl xl:max-w-xl">
            <CardHeader className="text-center">
              <CardTitle className="mt-2 text-2xl font-bold text-primary">DSC</CardTitle>
              <CardDescription>Development Secrets Consultancy</CardDescription>
              <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-[#c9a227] to-[#e6c200]" />
              <h1 className="mt-5 text-2xl font-bold text-primary">
                {t({ en: "Login", ar: "تسجيل الدخول" }, lang)}
              </h1>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Suspense fallback={null}>
                  <ExpertPendingNotice />
                </Suspense>
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOpen(true)
                        setResetSent(false)
                        setResetError("")
                      }}
                      className="text-sm font-medium text-[#c9a227] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="group relative h-10 w-full overflow-hidden rounded-lg text-base font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: "var(--dsc-gold)", color: "#fff" }}
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#e6c200] to-[#c9a227] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative z-10">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </span>
                </Button>
              </form>

              <div className="mt-6 border-t pt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-[#c9a227] hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetSent
                ? "If an account exists for this email, a reset link has been sent. Check your inbox (and spam folder)."
                : "Enter your account email and we will send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setForgotOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {resetError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {resetError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setForgotOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
