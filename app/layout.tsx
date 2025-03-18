import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// SEO and Open Graph metadata
export const metadata: Metadata = {
  title: {
    default: "Flourish | Custom Design Systems",
    template: "%s | Flourish"
  },
  description: "Supercharge your product development with a custom design system. Save on hiring, ship faster, and stay consistent.",
  generator: "Next.js",
  applicationName: "Flourish",
  keywords: ["design system", "product development", "UI/UX", "design consistency", "custom design"],
  authors: [{ name: "Flourish Team" }],
  creator: "Flourish",
  publisher: "Flourish",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://flourish.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://flourish.vercel.app",
    title: "Flourish | Custom Design Systems",
    description: "Supercharge your product development with a custom design system. Save on hiring, ship faster, and stay consistent.",
    siteName: "Flourish",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Flourish - Custom Design Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flourish | Custom Design Systems",
    description: "Supercharge your product development with a custom design system. Save on hiring, ship faster, and stay consistent.",
    images: ["/logo.jpg"],
    creator: "@hseruag",
    site: "@hseruag",
  },
  icons: {
    icon: [
      { url: "/logo.jpg" },
    ],
    shortcut: [
      { url: "/logo.jpg" },
    ],
    apple: [
      { url: "/logo.jpg" },
    ],
  },
}

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}