"use client"
import pb from "@/lib/pb"

/** PocketBase sends an expiring, single-use password setup link using its configured template. */
export async function sendCredentialsEmail(params: {
  email: string
  name: string
  password?: string
  caseName?: string
  caseUrl?: string
}): Promise<void> {
  await pb
    .collection("users")
    .requestPasswordReset(params.email.trim().toLowerCase())
}
