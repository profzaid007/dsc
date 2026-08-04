"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">DSC</CardTitle>
          <CardDescription>Development Secrets Consultancy</CardDescription>
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
                  className="text-sm font-medium text-primary hover:underline"
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

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
