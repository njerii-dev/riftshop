import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// This is the import line that connects your Navbar to the layout
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riftshop | Modern Marketplace",
  description: "Your one-stop shop for everything",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* We place the Navbar here so it appears at the top of every page */}
        <Navbar />
        
        {/* The {children} represents whatever page you are currently viewing */}
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}