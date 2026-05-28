import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDL 2026",
  description: "Mural Empresarial Extraordinário — Uma iniciativa PDL2026",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
