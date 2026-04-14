import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";

import { Toaster } from "sonner";

import QueryProvider from "@/components/QueryProvider";
import AuthProvider from "@/contexts/AuthContext";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "400", "600"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dashfly AI",
  description: "Assistente de vendas inteligente para sua loja",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${syne.variable} antialiased bg-background`}
      >
        <Toaster
          toastOptions={{
            style: { backgroundColor: "#16161b", border: "1px solid #1f1f24", color: "#d0d0e1" },
          }}
          theme="dark"
        />
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
