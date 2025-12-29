import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI WARS | Base Mainnet",
  description: "Capture the Neural Grid on Base.",
  other: {
    // 1. Existing Farcaster Frame Data
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://ai-wars-base.vercel.app/hero.png", // REMINDER: Update this URL after deploy
      button: {
        title: "Launch Node",
        action: {
          type: "launch_frame",
          name: "AI WARS",
          url: "https://ai-wars-base.vercel.app", // REMINDER: Update this URL after deploy
          splashImageUrl: "https://ai-wars-base.vercel.app/splash.png",
          splashBackgroundColor: "#0f172a",
        },
      },
    }),
    // 2. NEW: Base App Verification ID
    "base:app_id": "69520d57c63ad876c90817b4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}