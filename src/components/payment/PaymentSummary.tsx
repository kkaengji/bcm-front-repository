"use client";

import { formatCurrency } from "@/lib/utils";
import type { WinningProduct } from "@/hooks/payment/usePaymentOrder";

interface PaymentSummaryProps {
  winningProduct: WinningProduct;
  // shippingFee: number;
  // tax: number;
  totalAmount: number;
}

export default function PaymentSummary({
  winningProduct,
  // shippingFee,
  // tax,
  totalAmount,
}: PaymentSummaryProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-card border-border sticky top-20 space-y-4 rounded-lg border p-4 sm:space-y-6 sm:p-6 lg:top-24">
        {/* 상품 정보 */}
        <div>
          <h3 className="text-foreground mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
            낙찰 상품
          </h3>
          <div className="border-border mb-3 overflow-hidden rounded-lg border sm:mb-4">
            <img
              src={winningProduct.image || "/placeholder.svg"}
              alt={winningProduct.title}
              className="aspect-square w-full object-cover"
            />
          </div>
          <p className="text-foreground line-clamp-2 text-xs font-medium sm:text-sm">
            {winningProduct.title}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {winningProduct.seller}
          </p>
        </div>

        {/* 가격 정보 */}
        <div className="border-border space-y-2 border-b pb-3 sm:space-y-3 sm:pb-4">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">
              낙찰가 + 배송료 및 수수료
            </span>
            <span className="text-foreground font-medium">
              {formatCurrency(winningProduct.winningBid)}
            </span>
          </div>
        </div>

        {/* 총액 */}
        <div className="flex items-center justify-between">
          <span className="text-foreground text-sm font-semibold sm:text-base">
            총액
          </span>
          <span className="text-foreground text-xl font-bold sm:text-2xl">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
