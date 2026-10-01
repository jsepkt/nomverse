import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { QuickActionHUD } from "@/components/ui/QuickActionHUD";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#030712",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nomverse.org"),
  title: "NomVerse — The Open-Source Mascot of Web3 (CC0)",
  description:
    "NomVerse is the open-source CC0 home of Nomster — play the arcade game, create memes and skins, explore the lore, and build with the NomVerse community on Solana.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NomVerse",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "NomVerse — The Open-Source Mascot of Web3 (CC0)",
    description:
      "NomVerse is the open-source CC0 home of Nomster — play the arcade game, create memes and skins, explore the lore, and build with the NomVerse community on Solana.",
    images: ["/mascot.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "NomVerse — The Open-Source Mascot of Web3",
    description:
      "NomVerse is the open-source CC0 home of Nomster — play the arcade game, create memes and skins, explore the lore, and build with the NomVerse community on Solana.",
    images: ["/mascot.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-bs-theme="dark">
      <body suppressHydrationWarning className="bg-background text-foreground antialiased min-vh-100 d-flex flex-column w-100 overflow-x-hidden">
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <AppProviders>
          {children}
          <QuickActionHUD />
        </AppProviders>
      </body>
    </html>
  );
}

