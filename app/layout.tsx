import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ClientLayout from "./client-layout"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reclaim v2.0.0 - Análisis Financiero Personal",
  description: "Importa tus datos de MercadoPago y visualiza tus finanzas con gráficos, métricas y análisis detallados. Procesamiento 100% local y privado.",
  generator: "v0.app",
  keywords: ["finanzas personales", "análisis financiero", "MercadoPago", "presupuesto", "IA financiera", "datos bancarios"],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
