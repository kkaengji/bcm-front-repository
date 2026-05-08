import Navigation from "@/components/common/Navigation";
import ClientBottomNav from "@/components/common/ClientBottomNav";
import Footer from "@/components/common/Footer";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/user/useAuth";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blind Chicken Market",
  description: "Anonymous auction platform for second-hand goods",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`h-full ${inter.variable} ${notoSansKR.variable}`}>
      <head />
      <body className="flex h-full flex-col">
        <AuthProvider>
          <Navigation />
          <main className="flex-1 overflow-y-auto pb-20">
            {children}
            <Footer />
          </main>
          <ClientBottomNav />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
