import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReactQueryProvider } from "@/lib/react-query/provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwasthWrap - Your AI Health Companion",
  description: "Comprehensive health management with AI-powered assistance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
