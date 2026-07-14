"use client"

import { useState, useEffect, useCallback } from "react"
import pb from "@/lib/pb"
import type { User } from "@/types/user"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await pb.collection("users").getFullList({
        sort: "-created",
      })
      setUsers(data as unknown as User[])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUser = async (data: {
    email: string
    password: string
    passwordConfirm: string
    name: string
    role: string
    contact_number?: string
    is_active?: boolean
  }) => {
    try {
      const newUser = await pb.collection("users").create(data)
      setUsers((prev) => [newUser as unknown as User, ...prev])
      return newUser.id
    } catch (error) {
      console.error("Failed to create user:", error)
      throw error
    }
  }

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const updated = await pb.collection("users").update(id, data)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? (updated as unknown as User) : u))
      )
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error
    }
  }

  const refresh = fetchUsers

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    refresh,
  }
}
