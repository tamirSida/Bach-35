import type { Metadata } from "next";
import "./globals.css";
import "@/lib/fontawesome";

export const metadata: Metadata = {
  title: "באח 35 - מאגר תרגילים",
  description: "מערכת ניהול תרגילים לבאח 35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
