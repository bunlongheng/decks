import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fde047",
};

export const metadata: Metadata = {
  title: "Decks",
  description: "Turn ideas into beautiful slide decks instantly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://decks-bheng.vercel.app"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Decks",
  },
  openGraph: {
    title: "Decks - Slide Deck Generator",
    description: "Describe your topic, pick a theme, get a polished deck in seconds.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://decks-bheng.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decks - Slide Deck Generator",
    description: "Describe your topic, pick a theme, get a polished deck in seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
