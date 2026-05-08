"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatKoreanTime } from "@/lib/utils";
import { ProductBid } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface ProductBidHistoryProps {
  bids?: ProductBid[];
  bidCount: number;
  onOpenSidebar?: () => void;
  isConnected?: boolean;
  isAuctionExpired?: boolean;
  currentUserNickname?: string;
}

export function ProductBidHistory({
  bids = [],
  bidCount,
  onOpenSidebar,
  isConnected,
  isAuctionExpired,
  currentUserNickname,
}: ProductBidHistoryProps) {
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime(),
  );
  const visibleBids = sortedBids.slice(0, 3);
  const showLiveIndicator = !isAuctionExpired && isConnected !== undefined;

  return (
    <div className="border-border space-y-3 border-t pt-4 sm:space-y-4 sm:pt-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-base font-bold sm:text-lg">
            입찰 기록
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{bidCount}</p>
        </div>

        {/* 실시간 연결 인디케이터 */}
        {showLiveIndicator && (
          <div
            className={`flex items-center gap-1.5 text-[11px] font-medium ${
              isConnected ? "text-bcm-live" : "text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected
                  ? "bg-bcm-live animate-pulse"
                  : "bg-muted-foreground"
              }`}
            />
            {isConnected ? "실시간" : "연결 중..."}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleBids.length > 0 ? (
            visibleBids.map((bid, index) => {
              const isMyBid =
                currentUserNickname &&
                bid.bidderNickname === currentUserNickname;
              return (
                <motion.div
                  key={bid.productBidId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-colors sm:p-3 sm:text-sm ${
                    index === 0
                      ? "border-primary/30 bg-primary/8"
                      : "border-border/50 bg-card/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-price text-foreground font-semibold break-all tabular-nums">
                      {formatCurrency(bid.price)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatKoreanTime(bid.bidTime)}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1.5">
                    {isMyBid && (
                      <span className="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        나
                      </span>
                    )}
                    <span className="text-muted-foreground text-xs">
                      {bid.bidderNickname}
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              아직 입찰 기록이 없습니다.
            </p>
          )}
        </AnimatePresence>

        {bids.length > 0 && onOpenSidebar && (
          <Button
            onClick={onOpenSidebar}
            variant="outline"
            size="sm"
            className="mt-1 w-full text-xs"
          >
            더보기
          </Button>
        )}
      </div>
    </div>
  );
}
