import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatExpertRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}
