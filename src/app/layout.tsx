import Navigation from "@/components/common/Navigation";
import ClientBottomNav from "@/components/common/ClientBottomNav";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/user/useAuth";
import Script from "next/script";

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
    <html lang="ko" className="h-full">
      <head>
        <Script
          src="https://js.tosspayments.com/v2/standard"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex h-full flex-col">
        <AuthProvider>
          <Navigation />
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <ClientBottomNav />
          <footer className="hidden md:block">
            <div>© 2025 Darius Team</div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
