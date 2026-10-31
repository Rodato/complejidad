import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La renta del suelo en Cali · Taller 5",
  description:
    "El precio del metro cuadrado de Cali en las escrituras de 1941–1944 y en los avisos de 2020–2026, leído con Harvey (1982) y Smith (1979). Introducción a la Complejidad — Universidad del Valle, 2026-II.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "La renta del suelo en Cali",
    description:
      "Del cono de 1943 al cono roto de hoy: precios del suelo en Cali, renta capitalizada y brecha de renta. Taller 5, Introducción a la Complejidad.",
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
