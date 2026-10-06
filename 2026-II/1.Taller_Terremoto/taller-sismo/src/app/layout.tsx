import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cali ante el espejo del terremoto · Taller 1",
  description:
    "Taller guiado de lectura y uso de textos sobre el riesgo sísmico de Cali. Introducción a la Complejidad — Universidad del Valle, 2026-II.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Cali ante el espejo del terremoto",
    description:
      "Por qué un terremoto no es un desastre, y qué hace falta para que lo sea. Taller 1, Introducción a la Complejidad.",
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
