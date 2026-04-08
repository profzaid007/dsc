"use client"

import Link from "next/link"
import { useProfiles } from "@/hooks/useProfiles"
import { ProfileCard } from "@/components/profiles/ProfileCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderKanban, Plus } from "lucide-react"

export default function ProfilesPage() {
  const { profiles } = useProfiles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cases</h1>
          <p className="text-muted-foreground">Manage your cases</p>
        </div>
        <Link href="/dashboard/profiles/new">
          <Button>
            <Plus className="me-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No cases yet</h3>
            <p className="mb-4 text-center text-muted-foreground">
              Create your first case to get started
            </p>
            <Link href="/dashboard/profiles/new">
              <Button>Create Case</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
