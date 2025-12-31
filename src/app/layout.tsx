import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Enchanted Delights Bakery",
  description: "Artisan breads and pastries baked to order.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
