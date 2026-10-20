import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La burguesía azucarera en red · Taller 4",
  description:
    "Control de lectura de Collins (1983) y Wright (1980): las redes de los grupos azucareros del Valle del Cauca, sus parentescos y el Estado. Introducción a la Complejidad — Universidad del Valle, 2026-II.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "La burguesía azucarera en red",
    description:
      "Collins (1983) y Wright (1980) como redes: ingenios, accionistas, empresas y parentescos en el Valle del Cauca. Taller 4, Introducción a la Complejidad.",
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
