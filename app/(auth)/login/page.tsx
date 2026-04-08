"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const DEFAULT_USERS = [
  {
    email: "user@dsc.sc",
    password: "12345678",
    name: "Regular User",
    role: "user" as const,
  },
  {
    email: "admin@dsc.ac",
    password: "12345678",
    name: "Admin User",
    role: "admin" as const,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setIsLoading(true)
    setError("")

    const matchedUser = DEFAULT_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (matchedUser) {
      login(email, matchedUser.name, matchedUser.role)
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Use demo credentials below.")
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (user: (typeof DEFAULT_USERS)[0]) => {
    setEmail(user.email)
    setPassword(user.password)
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
              <Label htmlFor="password">Password</Label>
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

          <div className="mt-6 border-t pt-6">
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() => handleDemoLogin(DEFAULT_USERS[0])}
              >
                <span className="me-2 font-mono">user@dsc.sc</span>
                <span className="text-muted-foreground">| User</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={() => handleDemoLogin(DEFAULT_USERS[1])}
              >
                <span className="me-2 font-mono">admin@dsc.ac</span>
                <span className="text-muted-foreground">| Admin</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
