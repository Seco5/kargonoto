import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kargonoto — Kargo Yönetim Paneli",
  description: "Tüm kargo entegrasyonlarını tek panelden yönetin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
