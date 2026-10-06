import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taller de redes · Notaría 2 Cali",
  description:
    "Dibuja una red, observa emerger su distribución de grado y narra el proceso. Introducción a la Complejidad — Universidad del Valle.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Taller de redes · Notaría 2 de Cali",
    description:
      "Explora una red histórica, dibuja la tuya y observa emerger su distribución de grado.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
