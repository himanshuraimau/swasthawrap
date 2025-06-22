import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { Web3Provider } from "@/components/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SwasthWrap - Your AI Health Companion with Web3",
  description: "Comprehensive health management with AI-powered assistance and blockchain-secured medical records",
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
        <Web3Provider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
