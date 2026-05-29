import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "OBS Preview",
  description: "Self-hosted OBS preview player backed by MediaMTX and Nginx.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
