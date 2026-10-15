"use client"
import { useUiTranslation } from "@/hooks/useUiTranslation"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { confirmPasswordReset, getErrorMessage } from "@/lib/pb"

export function ResetPasswordForm() {
  const ui = useUiTranslation()

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!token) return
    if (password.length < 8) {
      setError(ui("Password must be at least 8 characters"))
      return
    }
    if (password !== confirm) {
      setError(ui("Passwords do not match"))
      return
    }

    setIsLoading(true)
    try {
      await confirmPasswordReset(token, password)
      setSuccess(true)
    } catch (err: unknown) {
      const status = (err as { status?: number } | null)?.status
      if (status === 400) {
        setError(ui("Invalid or expired reset link. Please request a new one."))
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {ui("Reset Password")}
          </CardTitle>
          <CardDescription>
            {success
              ? ui("Your password has been reset successfully. You can now sign in with your new password.")
              : token
                ? ui("Enter a new password for your account.")
                : ui("This reset link is invalid or has expired. Please request a new one from the login page.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex justify-center">
              <Button onClick={() => router.push("/login")}>{ui("Go to Login")}</Button>
            </div>
          ) : !token ? (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => router.push("/login")}>
                {ui("Back to Login")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">{ui("New Password")}</Label>
                <PasswordInput
                  id="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{ui("Confirm Password")}</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? ui("Resetting...") : ui("Reset Password")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
