import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://buzzlead-high-intent-generator.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "High-Intent Signal Generator | BuzzLead",
    template: "%s | BuzzLead",
  },
  description:
    "Discover the top 5 high-intent buying signals in your market and get ready-to-launch campaign playbooks with outreach scripts.",
  openGraph: {
    type: "website",
    siteName: "BuzzLead",
    title: "High-Intent Signal Generator — BuzzLead",
    description:
      "Discover the top 5 high-intent buying signals in your market and get ready-to-launch campaign playbooks with outreach scripts.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "High-Intent Signal Generator — BuzzLead",
    description:
      "Discover the top 5 high-intent buying signals in your market and get ready-to-launch campaign playbooks with outreach scripts.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${inter.variable} ${instrumentSerif.variable} ${GeistSans.variable} ${GeistMono.variable}`;
  return (
    <html lang="en" className={fontVars}>
      <body className="grain">{children}</body>
    </html>
  );
}
