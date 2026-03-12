import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa/pwa-register";

export const metadata: Metadata = {
  title: "Portal Frutos do Espirito",
  description: "Portal digital do Clube de Desbravadores Frutos do Espirito",
  manifest: "/manifest.webmanifest",
  themeColor: "#C1121F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Frutos Portal"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/icon-192.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>
          <PwaRegister />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
