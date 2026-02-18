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
import Script from "next/script";

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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WMF459423C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-WMF459423C');
          `}
        </Script>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
