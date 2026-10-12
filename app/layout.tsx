import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { GlobalErrorListener } from "@/components/layout/global-error-listener"
import { Toaster } from "@/components/ui/toast"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body>
        {children}
        <GlobalErrorListener />
        <Toaster />
      </body>
    </html>
  )
}
