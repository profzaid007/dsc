"use client"
import { useSyncExternalStore } from "react"
import pb from "@/lib/pb"
import { securityApi } from "@/lib/security"
import {
  securityFailure,
  validSecurityAccess,
  type SecurityFailure,
} from "@/lib/security-failure"

type Snapshot = {
  permissions: string[]
  is_super_admin: boolean
  isLoading: boolean
  error: boolean
  failure: SecurityFailure | null
}
const empty: Snapshot = {
  permissions: [],
  is_super_admin: false,
  isLoading: true,
  error: false,
  failure: null,
}
let snapshot = empty
let token = ""
let revision = 0
let pending: Promise<void> | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((fn) => fn())
function load(force = false) {
  const next =
    pb.authStore.isValid && pb.authStore.record?.is_active !== false
      ? pb.authStore.token
      : ""
  if (next !== token) {
    token = next
    revision++
    pending = null
    snapshot = { ...empty }
    emit()
  }
  if (!next) {
    snapshot = { ...empty, isLoading: false }
    emit()
    return
  }
  if (pending || (!force && !snapshot.isLoading)) return
  const generation = ++revision
  pending = securityApi<{ permissions: string[]; is_super_admin: boolean }>(
    "/me"
  )
    .then((data) => {
      if (!validSecurityAccess(data))
        throw new Error("Invalid security service response")
      if (generation === revision)
        snapshot = {
          permissions: [...data.permissions],
          is_super_admin: data.is_super_admin,
          isLoading: false,
          error: false,
          failure: null,
        }
    })
    .catch((error: unknown) => {
      if (generation === revision)
        snapshot = {
          ...empty,
          isLoading: false,
          error: true,
          failure: securityFailure(error),
        }
    })
    .finally(() => {
      if (generation === revision) {
        pending = null
        emit()
      }
    })
}
let started = false
function subscribe(fn: () => void) {
  listeners.add(fn)
  if (!started) {
    started = true
    pb.authStore.onChange(() => load(true))
    window.addEventListener("focus", () => load(true))
    window.addEventListener("dsc:permissions-changed", () => load(true))
  }
  load()
  return () => {
    listeners.delete(fn)
  }
}
export function usePermissions() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => empty
  )
  return {
    ...state,
    isSuperAdmin: state.is_super_admin,
    can: (permission: string) =>
      !state.isLoading &&
      !state.error &&
      (state.is_super_admin || state.permissions.includes(permission)),
    refresh: () => load(true),
  }
}
