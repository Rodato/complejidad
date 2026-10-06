import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nodos, vínculos y poder · Taller 2",
  description:
    "Taller guiado de teoría de redes: por qué los Medici, y no los Strozzi, terminaron mandando en Florencia. Introducción a la Complejidad — Universidad del Valle, 2026-II.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Nodos, vínculos y poder",
    description:
      "Por qué los Medici, sin ser los más ricos, terminaron mandando en Florencia. Taller 2, Introducción a la Complejidad.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf9f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}
