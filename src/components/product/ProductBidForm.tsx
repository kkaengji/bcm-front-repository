"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Zap } from "lucide-react";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePreSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmedBid = () => {
    setShowConfirmModal(false);
    onSubmit();
  };

  const quickAmounts = [
    { label: "최소", amount: minBidValue },
    { label: "+1만", amount: minBidValue + 10000 },
    { label: "+5만", amount: minBidValue + 50000 },
  ];

  if (!showForm) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onShowForm}
          size="lg"
          className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-px active:translate-y-0"
          disabled={!isLoggedIn || isOwner || isAuctionExpired}
        >
          {isAuctionExpired ? (
            "경매가 종료되었습니다"
          ) : !isLoggedIn ? (
            "로그인이 필요합니다"
          ) : isOwner ? (
            "본인 상품입니다"
          ) : (
            <>
              <Zap className="h-4 w-4" />
              입찰하기
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 rounded-xl border border-primary/20 bg-accent/10 p-4">
        {/* 빠른 입찰 버튼 */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">빠른 입찰</p>
          <div className="flex gap-2">
            {quickAmounts.map(({ label, amount }) => (
              <button
                key={label}
                type="button"
                onClick={() => onBidAmountChange(String(amount))}
                className="flex-1 rounded-lg border border-border/60 bg-secondary/50 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent/30 hover:text-primary active:scale-95"
              >
                {label}
                <span className="mt-0.5 block text-[10px] font-normal opacity-70">
                  {formatCurrency(amount)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-foreground text-sm font-medium">입찰가</label>
            <span className="text-muted-foreground text-xs">
              단위: {formatCurrency(minBidIncrement)}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            최소: {formatCurrency(minBidValue)}
          </p>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => onBidAmountChange(e.target.value)}
            className="font-price bg-background border-border text-foreground placeholder:text-muted-foreground mt-2 w-full rounded-lg border px-3 py-3 text-base font-bold tabular-nums transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            min={minBidValue}
            step={minBidIncrement}
            placeholder={String(minBidValue)}
          />
          {bidError && (
            <p className="text-bcm-urgent mt-2 text-xs font-medium">{bidError}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePreSubmit}
            size="sm"
            className="flex-1 rounded-lg shadow-md shadow-primary/15"
          >
            입찰하기
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

      {/* 입찰 확인 모달 */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-sm rounded-2xl border-white/8 bg-card">
          <DialogHeader>
            <DialogTitle className="text-center font-black">입찰 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="font-price text-foreground text-3xl font-black tabular-nums">
              {formatCurrency(Number(bidAmount) || 0)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              로 입찰하시겠습니까?
            </p>
          </div>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1 shadow-lg shadow-primary/20"
              onClick={handleConfirmedBid}
            >
              입찰하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
