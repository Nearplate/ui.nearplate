import type { Metadata } from "next"
import { Anton, Geist, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { GlobalErrorListener } from "@/components/layout/global-error-listener"
import { Toaster } from "@/components/ui/toast"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const fontDisplay = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

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
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        fontDisplay.variable
      )}
    >
      <body>
        {children}
        <GlobalErrorListener />
        <Toaster />
      </body>
    </html>
  )
}
