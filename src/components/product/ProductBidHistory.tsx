"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatKoreanTime } from "@/lib/utils";
import { ProductBid } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface ProductBidHistoryProps {
  bids?: ProductBid[];
  bidCount: number;
  showAll: boolean;
  onToggleShow: () => void;
  maxVisible?: number; // 최대 표시 개수 (더보기 시)
  collapsedCount?: number; // 접힘 상태에서 표시 개수
}

export function ProductBidHistory({
  bids = [],
  bidCount,
  showAll,
  onToggleShow,
  maxVisible = 5,
  collapsedCount = 1,
}: ProductBidHistoryProps) {
  const sortedBids = [...bids].sort(
    (a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime(),
  );
  const visibleBids = sortedBids.slice(
    0,
    showAll ? maxVisible : collapsedCount,
  );

  return (
    <div className="border-border space-y-3 border-t pt-4 sm:space-y-4 sm:pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-foreground text-base font-bold sm:text-lg">
          입찰 기록
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm">{bidCount}</p>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleBids.length > 0 ? (
            visibleBids.map((bid, index) => (
              <motion.div
                key={bid.productBidId}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className={`bg-muted border-border flex items-center justify-between rounded-lg border p-2.5 text-xs sm:p-3 sm:text-sm ${
                  index === 0 ? "border-green-300 bg-green-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-semibold break-all">
                    {formatCurrency(bid.price)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatKoreanTime(bid.bidTime)}
                  </p>
                </div>
                <span className="text-muted-foreground ml-2 text-xs">
                  {bid.bidderNickname}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              아직 입찰 기록이 없습니다.
            </p>
          )}
        </AnimatePresence>
        {bids.length > collapsedCount && (
          <Button
            onClick={onToggleShow}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            {showAll
              ? "접기"
              : `더보기 (${Math.min(bids.length - collapsedCount, maxVisible - collapsedCount)}개)`}
          </Button>
        )}
      </div>
    </div>
  );
}
