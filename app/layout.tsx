import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filoix Ramadan Calender",
  description: "A premium Ramadan Calendar & Planner for Bangladesh",
};

import Navbar from "./components/Navbar";
import PromoBanner from "./components/PromoBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-custom-bg text-white`}
      >
        <PromoBanner />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
