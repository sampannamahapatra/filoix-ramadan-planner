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
  title: "ফিলোইক্স রমজান ক্যালেন্ডার",
  description: "বাংলাদেশের জন্য প্রিমিয়াম রমজান ক্যালেন্ডার ও আমল পরিকল্পনাকারী",
};

import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-custom-bg text-white`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
