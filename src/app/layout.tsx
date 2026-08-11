import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMACO Quotation Builder",
  description:
    "Africa Merchant Assurance Company — multi-class insurance quotation builder from the Master Quotation Template.",
  icons: {
    icon: "/favicon-amaco.png",
    shortcut: "/favicon-amaco.png",
    apple: "/favicon-amaco.png",
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
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
