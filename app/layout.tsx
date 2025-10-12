import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import 'mapbox-gl/dist/mapbox-gl.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GeoSafe Map - Real-time Hazard Monitoring",
  description: "All hazards. One map. Real-time awareness for safer communities.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GeoSafe Map"
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3B82F6",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

