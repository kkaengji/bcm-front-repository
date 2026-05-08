"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user/useAuth";
import { motion } from "framer-motion";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden border-b border-white/8">
      {/* 앰비언트 글로우 배경 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
        <div className="max-w-3xl space-y-5">
          {/* Live 뱃지 */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">
              Live Auctions
            </span>
          </div>

          {/* 헤드라인 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-foreground text-4xl font-black leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Blind Chicken{" "}
            <span className="text-primary">Market</span>
          </motion.h1>

          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed text-pretty sm:text-base md:text-lg">
            The Last Bidder Wins. This is Blind Chicken Market.
            <br />
            가장 늦게, 가장 용감하게. 블라인드 치킨 마켓에서 승리하세요.
          </p>

          <div className="flex items-center gap-3 pt-2 sm:pt-4">
            {user ? (
              <Button
                size="lg"
                asChild
                className="rounded-xl font-semibold shadow-lg shadow-primary/20"
              >
                <Link href="/products/create">상품 등록</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-xl font-semibold"
              >
                <Link href="/login">로그인 후 상품을 등록하세요</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
