import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { AppSplashScreen } from "@/components/pwa/app-splash-screen";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Clube Frutos do Espírito",
  description: "Site do Clube de Desbravadores Frutos do Espírito",
  manifest: "/manifest.webmanifest",
  themeColor: "#2E7D32",
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
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AppSplashScreen />
        <SessionProvider>
          <PwaRegister />
          {children}
          <Toaster />
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}