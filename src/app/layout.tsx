import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  metadataBase: new URL("https://nomverse.org"),
  title: "NomVerse — The Hungry Open-Source Mascot of Web3 (CC0)",
  description:
    "An open-source, 100% CC0 public domain mascot universe backing a community coin launched on pump.fun. Feed Nomster Solana candies in the interactive arcade mini-game and submit living lore via GitHub PRs.",
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
  openGraph: {
    title: "NomVerse — The Hungry Open-Source Mascot of Web3 (CC0)",
    description:
      "100% CC0 public domain mascot universe, interactive Phaser physics mini-game, and community lore engine for pump.fun.",
    images: ["/mascot.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "NomVerse — The Hungry Open-Source Mascot of Web3",
    description: "100% CC0 Public Domain Web3 Mascot Universe ready for pump.fun fair launch.",
    images: ["/mascot.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

