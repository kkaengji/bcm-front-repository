"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ProductBidFormProps {
  showForm: boolean;
  bidAmount: string;
  bidError: string | null;
  minBidValue: number;
  minBidIncrement: number;
  isAuctionExpired: boolean;
  isOwner: boolean;
  isLoggedIn: boolean;
  onShowForm: () => void;
  onHideForm: () => void;
  onBidAmountChange: (value: string) => void;
  onSubmit: () => void;
}

export function ProductBidForm({
  showForm,
  bidAmount,
  bidError,
  minBidValue,
  minBidIncrement,
  isAuctionExpired,
  isOwner,
  isLoggedIn,
  onShowForm,
  onHideForm,
  onBidAmountChange,
  onSubmit,
}: ProductBidFormProps) {
  if (!showForm) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onShowForm}
          size="lg"
          className="w-full rounded-lg"
          disabled={!isLoggedIn || isOwner || isAuctionExpired}
        >
          {isAuctionExpired
            ? "경매가 종료되었습니다"
            : !isLoggedIn
              ? "로그인이 필요합니다"
              : isOwner
                ? "본인 상품입니다"
                : "입찰하기"}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-border bg-card space-y-4 rounded-lg border p-4">
      <div>
        <label className="text-foreground text-sm font-medium">입찰가</label>
        <p className="text-muted-foreground mt-1 text-xs">
          최소: {formatCurrency(minBidValue)}
        </p>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => onBidAmountChange(e.target.value)}
          className="bg-background border-border text-foreground focus:ring-primary placeholder:text-muted-foreground mt-2 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
          min={minBidValue}
          step={minBidIncrement}
        />
        {bidError && (
          <p className="mt-2 text-xs font-medium text-red-500">{bidError}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={onSubmit} size="sm" className="flex-1 rounded-lg">
          입찰 확정
        </Button>
        <Button
          onClick={onHideForm}
          variant="outline"
          size="sm"
          className="flex-1 rounded-lg"
        >
          취소
        </Button>
      </div>
    </div>
  );
}
