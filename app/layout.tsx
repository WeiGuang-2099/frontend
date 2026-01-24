import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosmray",
  description: "欢迎来到 Cosmray - 未来科技平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
