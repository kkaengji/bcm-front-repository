"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency, getBlindTimeText, isAuctionExpired, getTimeRemainMs, BLIND_THRESHOLD_MS } from "@/lib/utils";
import { AlarmClock } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistSection() {
  const { items, toggle } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">찜한 상품이 없습니다</p>
        <p className="text-muted-foreground mt-1 text-xs">
          관심 있는 경매 상품을 저장해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const expired = isAuctionExpired(item.bidEndDate);
        const blindText = getBlindTimeText(item.bidEndDate);
        const isBlind = !expired && getTimeRemainMs(item.bidEndDate) <= BLIND_THRESHOLD_MS;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <Link href={`/products/${item.id}`} className="block h-full">
              <div className="group flex h-full cursor-pointer flex-col">
                <div className="bg-muted relative mb-3 aspect-square overflow-hidden rounded-xl sm:mb-4">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                      expired ? "opacity-40 grayscale" : ""
                    }`}
                  />

                  {/* 그라디언트 오버레이 */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* 시간 뱃지 */}
                  <div
                    className={`absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${
                      expired
                        ? "bg-black/60 text-white/50"
                        : isBlind
                          ? "animate-pulse bg-bcm-urgent/80 text-white"
                          : "bg-black/50 text-white"
                    }`}
                  >
                    <AlarmClock size={10} />
                    {expired ? "경매 종료" : isBlind ? "마감 임박 🔥" : blindText}
                  </div>

                  {/* 찜 해제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(item);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-primary/20 p-1.5 text-primary backdrop-blur-sm transition-all hover:bg-primary/30 active:scale-90"
                    title="찜 해제"
                  >
                    <Heart className="h-3.5 w-3.5" fill="currentColor" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col space-y-1.5">
                  <h3 className="text-foreground line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base">
                    {item.name}
                  </h3>
                  <p className="font-price text-foreground text-lg font-bold sm:text-xl">
                    {formatCurrency(item.bidPrice)}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
