import type { Metadata, Viewport } from "next";
import { Literata, Public_Sans } from "next/font/google";
import "./globals.css";

// Judul dan pertanyaan: Literata, serif yang dirancang untuk dibaca di layar ponsel. Isi dan antarmuka: Public Sans.
// next/font mengunduh saat build dan menyajikan dari domain sendiri: tidak ada permintaan runtime ke Google.
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], display: "swap" });
const publicSans = Public_Sans({ variable: "--font-public", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "OddMind",
  description: "Latihan bicara dan berpikir kritis. Rekam jawabanmu, dapat penilaian berbukti dari ucapanmu sendiri.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${literata.variable} ${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
