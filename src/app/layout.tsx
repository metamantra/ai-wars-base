import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Keep your Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Add the Mini App Metadata Here
export const metadata: Metadata = {
  title: "AI WARS | Base Testnet",
  description: "Capture the Neural Grid on Base.",
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://aiwars.vercel.app/hero.png", // REMINDER: Update this URL after deploy
      button: {
        title: "Launch Node",
        action: {
          type: "launch_frame",
          name: "AI WARS",
          url: "https://aiwars.vercel.app", // REMINDER: Update this URL after deploy
          splashImageUrl: "https://aiwars.vercel.app/splash.png",
          splashBackgroundColor: "#0f172a",
        },
      },
    }),
  },
};

// 3. Keep the Layout Structure with Fonts
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