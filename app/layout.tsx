import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDL 2026",
  description: "Mural Empresarial Extraordinário — Publique aqui sua Visão extraordinária empresarial com a WMC dentro dos próximos 3 a 5 anos.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
      { url: "/icon.svg?v=4", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg?v=4",
    apple: "/favicon.svg?v=4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
