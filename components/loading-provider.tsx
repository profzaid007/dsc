"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const counterRef = useRef(0)

  const startLoading = useCallback(() => {
    counterRef.current += 1
    setIsLoading(true)
    // Auto-stop after 10s to prevent stuck loading
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      counterRef.current = 0
      setIsLoading(false)
    }, 10000)
  }, [])

  const stopLoading = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1)
    if (counterRef.current === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
