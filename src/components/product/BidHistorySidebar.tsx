"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, TrendingUp } from "lucide-react";
import { ProductBid } from "@/types";
import { formatCurrency, formatKoreanTime } from "@/lib/utils";
import { BidPriceChart } from "./BidPriceChart";

interface BidHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bids: ProductBid[];
  startPrice: number;
  productName: string;
}

export function BidHistorySidebar({
  isOpen,
  onClose,
  bids,
  startPrice,
  productName,
}: BidHistorySidebarProps) {
  const chronoBids = [...bids].sort(
    (a, b) => new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime(),
  );
  const recentFirst = [...chronoBids].reverse();

  const latestPrice = chronoBids.at(-1)?.price ?? startPrice;
  const firstPrice = chronoBids[0]?.price ?? startPrice;
  const priceDiff = latestPrice - firstPrice;
  const priceDiffPct =
    firstPrice > 0 ? ((priceDiff / firstPrice) * 100).toFixed(1) : "0.0";
  const isUp = priceDiff >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="bg-background fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-foreground text-base font-bold">
                  입찰 내역
                </h2>
                <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                  {productName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Price Summary */}
              <div className="border-border border-b px-5 py-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">최근 낙찰가</p>
                    <p className="font-price text-foreground mt-0.5 text-2xl font-black tabular-nums">
                      {formatCurrency(latestPrice)}
                    </p>
                  </div>
                  {bids.length > 1 && (
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        isUp ? "text-bcm-urgent" : "text-primary"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {isUp ? "+" : ""}
                        {priceDiffPct}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Section */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-foreground mb-2 text-xs font-semibold">
                  시세 차트
                </p>
                <BidPriceChart bids={chronoBids} startPrice={startPrice} />
              </div>

              {/* Divider */}
              <div className="border-border mx-5 border-t" />

              {/* Bid History List */}
              <div className="px-5 pt-4 pb-8">
                <p className="text-foreground mb-3 text-xs font-semibold">
                  구매 입찰 내역
                  <span className="text-muted-foreground ml-1.5 font-normal">
                    ({bids.length}건)
                  </span>
                </p>

                {bids.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    아직 입찰 내역이 없습니다.
                  </p>
                ) : (
                  <div>
                    {/* Column headers */}
                    <div className="text-muted-foreground/60 mb-1.5 flex items-center justify-between px-0.5 text-[10px] font-medium tracking-wide uppercase">
                      <span>일시 / 입찰자</span>
                      <span>금액</span>
                    </div>

                    {recentFirst.map((bid, i) => (
                      <div
                        key={bid.productBidId}
                        className={`border-border/40 flex items-center justify-between border-b py-3 ${
                          i === 0 ? "opacity-100" : "opacity-75"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {i === 0 && (
                              <span className="bg-primary/15 text-primary shrink-0 rounded-sm px-1 py-px text-[9px] font-bold">
                                최고가
                              </span>
                            )}
                            <p className="text-muted-foreground text-xs">
                              {formatKoreanTime(bid.bidTime)}
                            </p>
                          </div>
                          <p className="text-muted-foreground/70 mt-0.5 text-xs">
                            {bid.bidderNickname}
                          </p>
                        </div>
                        <p
                          className={`font-price ml-4 shrink-0 tabular-nums ${
                            i === 0
                              ? "text-foreground text-sm font-bold"
                              : "text-muted-foreground text-sm font-medium"
                          }`}
                        >
                          {formatCurrency(bid.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
