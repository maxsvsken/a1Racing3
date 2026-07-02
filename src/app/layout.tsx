import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "А1 — Инвестиционная компания | Инвестиции в специальные ситуации",
  description: "А1 — ведущая инвестиционная компания России, эксперт по разрешению сложных корпоративных споров и реструктуризации активов. Защищаем капитал и восстанавливаем жизнеспособность бизнеса.",
  keywords: "А1, инвестиции, специальные ситуации, корпоративные споры, реструктуризация активов, Александр Файн, инвестиционная компания",
  authors: [{ name: "А1" }],
  openGraph: {
    title: "А1 — Инвестиции в специальные ситуации",
    description: "Ведущая инвестиционная компания России. Эксперт по разрешению корпоративных конфликтов и управлению сложными активами.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${outfit.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full bg-deep-black text-metal-white selection:bg-racing-red selection:text-white flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
