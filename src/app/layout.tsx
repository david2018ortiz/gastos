import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { ThemeScript } from "@/components/theme-script";
import { PageTransition } from "@/components/page-transition";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walley",
  description: "Gestión personal de ingresos, gastos, deudas y ahorro con ayuda de IA.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Walley",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#146152",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className="min-h-full flex flex-col bg-page text-ink"
        suppressHydrationWarning
      >
        <PageTransition>{children}</PageTransition>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
