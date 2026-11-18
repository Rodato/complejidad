import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quién ordena Cali · Taller 6",
  description:
    "Control de lectura de la carta de Camacol Valle al alcalde ad hoc sobre el ajuste del POT de Cali (noviembre de 2026). Introducción a la Complejidad — Universidad del Valle, 2026-II.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "Quién ordena Cali",
    description:
      "Quién negocia el POT, quién queda por fuera, el agua del río Cauca y el terremoto que la carta no nombra. Taller de Introducción a la Complejidad.",
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
