import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MINTAKA",
  description: "MINTAKA · Plataforma de gestión integral de telecomunicaciones",
  generator: "Next.js",
  icons: {
    icon: [
      {
        url: "1.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/1.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/1.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/1.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen bg-gradient-to-br from-background to-muted`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
