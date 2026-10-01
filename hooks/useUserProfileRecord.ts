"use client"

import { useCallback, useEffect, useState } from "react"
import pb, { getErrorMessage } from "@/lib/pb"
import { ROLE_PROFILE_COLLECTION, type AnyUserProfile } from "@/types/account-profile"
import type { UserRole } from "@/types/user"

/**
 * Loads the profile record that matches a user's role. Both a role with no
 * profile collection (admins) and a record that was never created resolve to
 * null without an error, since neither is a failure for an admin browsing
 * users.
 *
 * `role` being undefined means it is not known yet, which keeps `isLoading`
 * true. Treating that as "no profile" would briefly render an empty profile
 * before the users list resolves.
 */
export function useUserProfileRecord(userId?: string, role?: UserRole) {
  const [profile, setProfile] = useState<AnyUserProfile | null>(null)
  const [fileToken, setFileToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const collectionName = role ? ROLE_PROFILE_COLLECTION[role] : undefined
  const isRoleKnown = Boolean(role)

  const load = useCallback(async () => {
    if (!isRoleKnown) {
      // Waiting on the users list; load() re-runs once the role arrives.
      return
    }
    if (!userId || !collectionName) {
      setProfile(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError("")
    try {
      const record = await pb
        .collection(collectionName)
        .getFirstListItem(`user = "${userId}"`)
      setProfile(record as unknown as AnyUserProfile)
    } catch (error) {
      setProfile(null)
      const status = (error as { status?: number }).status
      if (status !== 404) {
        setLoadError(getErrorMessage(error))
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, collectionName, isRoleKnown])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    pb.files
      .getToken()
      .then((token) => {
        if (!cancelled) setFileToken(token)
      })
      .catch(() => {
        if (!cancelled) setFileToken("")
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { profile, fileToken, isLoading, loadError, reload: load }
}