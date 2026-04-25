import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

import { Providers } from "@/components/Providers";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Emora - Your Emotional Companion",
  description: "A safe space to express, reflect, and heal.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Emora - Your Emotional Companion",
    description: "A safe space to express, reflect, and heal.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Emora AI Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emora - Your Emotional Companion",
    description: "A safe space to express, reflect, and heal.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
