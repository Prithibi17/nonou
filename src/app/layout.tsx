import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BusinessOS — Modern Modular ERP Platform",
  description: "Next-generation universal business application platform & operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background font-sans antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
