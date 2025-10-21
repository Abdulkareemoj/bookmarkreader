"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useReaderStore } from "@/lib/store"

interface ReaderContextType {
  fontSize: number
  setFontSize: (size: number) => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined)

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const fontSize = useReaderStore((state) => state.fontSize)
  const setFontSize = useReaderStore((state) => state.setFontSize)
  const theme = useReaderStore((state) => state.theme)
  const setTheme = useReaderStore((state) => state.setTheme)

  return <ReaderContext.Provider value={{ fontSize, setFontSize, theme, setTheme }}>{children}</ReaderContext.Provider>
}

export function useReaderContext() {
  const context = useContext(ReaderContext)
  if (!context) {
    throw new Error("useReaderContext must be used within ReaderProvider")
  }
  return context
}
