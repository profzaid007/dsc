import PocketBase from "pocketbase"

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
)

pb.autoCancellation(false)

export const authStore = pb.authStore

export function getCurrentUser() {
  if (!pb.authStore.isValid || !pb.authStore.model) {
    return null
  }
  return pb.authStore.model as any
}

export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || user?.role === "super_admin"
}

export async function authWithPassword(email: string, password: string) {
  const authData = await pb
    .collection("users")
    .authWithPassword(email, password)
  return authData
}

export async function refreshAuth() {
  if (!pb.authStore.isValid) {
    throw new Error("No valid auth token")
  }
  await pb.collection("users").authRefresh()
}

export async function logout() {
  pb.authStore.clear()
}

export function handlePocketBaseError(error: any): string {
  if (error?.message?.includes("fetch")) {
    return "PocketBase server is not accessible. Please check if the server is running."
  }
  if (error?.status === 400) {
    return "Invalid request data. Please check your input."
  }
  if (error?.status === 401) {
    return "Authentication required. Please log in."
  }
  if (error?.status === 403) {
    return "Access denied. You do not have permission to perform this action."
  }
  if (error?.status === 404) {
    return "Resource not found. The requested item may have been deleted."
  }
  if (error?.status === 422) {
    return "Validation error. Please check your input data."
  }
  if (error?.status >= 500) {
    return "Server error. Please try again later."
  }
  return error?.message || "An unexpected error occurred. Please try again."
}

export default pb
