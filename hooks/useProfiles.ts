import { useAppStore } from "@/lib/store"
import type { Profile } from "@/types/profile"

export function useProfiles() {
  const profiles = useAppStore((state) => state.profiles)
  const currentUser = useAppStore((state) => state.currentUser)

  const addProfile = useAppStore((state) => state.addProfile)
  const updateProfile = useAppStore((state) => state.updateProfile)
  const deleteProfile = useAppStore((state) => state.deleteProfile)
  const getProfileById = useAppStore((state) => state.getProfileById)
  const getProfilesByUser = useAppStore((state) => state.getProfilesByUser)

  const userProfiles = currentUser ? getProfilesByUser(currentUser.id) : []

  return {
    profiles,
    userProfiles,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfileById,
    getProfilesByUser,
  }
}
