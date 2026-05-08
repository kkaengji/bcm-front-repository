"use client";

import Link from "next/link";
import { Product } from "@/types";
import { AlarmClock } from "lucide-react";
import { formatCurrency, isAuctionExpired, getTimeRemainMs, getBlindTimeText, BLIND_THRESHOLD_MS } from "@/lib/utils";
import { motion } from "framer-motion";
import WishlistButton from "@/components/common/WishlistButton";

export default function ProductCard({
  product,
  currentPage = 0,
}: {
  product: Product;
  currentPage?: number;
}) {
  const expired = isAuctionExpired(product.bidEndDate);
  const blindText = getBlindTimeText(product.bidEndDate);
  const isBlind = !expired && getTimeRemainMs(product.bidEndDate) <= BLIND_THRESHOLD_MS;

  return (
    <Link href={`/products/${product.id}?page=${currentPage}`} className="block h-full">
      <motion.div
        className="group flex h-full cursor-pointer flex-col"
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Image Container */}
        <div className="bg-muted relative mb-3 aspect-square overflow-hidden rounded-xl sm:mb-4">
          <img
            src={product.thumbnail || "/placeholder.svg"}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
              expired ? "opacity-40 grayscale" : ""
            }`}
          />

          {/* 하단 그라디언트 오버레이 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          {/* 시간 뱃지 — 이미지 하단 좌측 */}
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

          {/* 종료 배지 — 이미지 좌상단 */}
          {expired && (
            <div className="absolute top-2 left-2 z-10 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white/80 backdrop-blur-sm">
              종료
            </div>
          )}

          {/* 찜 버튼 — 이미지 우상단 */}
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              product={{
                id: product.id,
                name: product.name,
                thumbnail: product.thumbnail || "",
                bidPrice: product.bidPrice,
                bidEndDate: product.bidEndDate,
                bidStatus: product.bidStatus,
              }}
              size="sm"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col space-y-1.5 sm:space-y-2">
          <h3 className="text-foreground line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base">
            {product.name}
          </h3>
          <p className="font-price text-foreground text-lg font-bold sm:text-xl md:text-2xl">
            {formatCurrency(product.bidPrice)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
