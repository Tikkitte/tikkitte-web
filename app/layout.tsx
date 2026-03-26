import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tikkitte | Find Events in Ghana",
  description: "Discover and buy tickets to events happening in Ghana. No account needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geist.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
