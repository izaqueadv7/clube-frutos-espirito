import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { AppSplashScreen } from "@/components/pwa/app-splash-screen";

export const metadata: Metadata = {
  title: "Clube Frutos do Espirito",
  description: "Site do Clube de Desbravadores Frutos do Espirito",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clube Frutos"
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
  const themeScript = `
    (function () {
      try {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        document.documentElement.classList.remove("dark");
      }
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-surface text-ink">
        <AppSplashScreen />
        <SessionProvider>
          <PwaRegister />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}