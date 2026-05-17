import type { Metadata } from "next";
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
  title: "Catavento — Controle financeiro que olha pra frente",
  description:
    "Projeção de caixa para 12 meses, simulador de compras e assistente IA. Para autônomos, MEIs e profissionais liberais que misturam PJ e PF.",
  keywords: [
    "controle financeiro",
    "projeção de caixa",
    "PJ PF",
    "autônomo",
    "MEI",
    "simulador",
  ],
  openGraph: {
    title: "Catavento — Controle financeiro que olha pra frente",
    description:
      "Pare de adivinhar se vai sobrar dinheiro no fim do mês. Projeção de caixa para 12 meses, simulador de compras e assistente IA.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
