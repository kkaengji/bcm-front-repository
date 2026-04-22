"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user/useAuth";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="border-border border-b py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl lg:text-5xl">
            Blind Chicken Market
          </h1>
          <p className="text-muted-foreground max-w-2xl text-[10px] leading-relaxed text-pretty sm:text-sm md:text-base lg:text-lg">
            The Last Bidder Wins. This is Blind Chicken Market.
            <br />
            가장 늦게, 가장 용감하게. 블라인드 치킨 마켓에서 승리하세요.
          </p>

          {user && (
            <div className="flex gap-3 pt-2 sm:pt-4">
              <Button size="lg" asChild className="rounded-lg">
                <Link href="/products/create">상품 등록</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
