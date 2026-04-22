"use client";

import { Button } from "@/components/ui/button";

interface PaymentWidgetProps {
  widgetReady: boolean;
  isProcessing: boolean;
  onPayment: () => void;
}

export default function PaymentWidget({
  widgetReady,
  isProcessing,
  onPayment,
}: PaymentWidgetProps) {
  return (
    <div className="bg-card border-border space-y-4 rounded-lg border p-4 sm:space-y-6 sm:p-6">
      <h2 className="text-foreground text-xl font-bold sm:text-2xl">
        결제 정보
      </h2>

      {/* 토스페이먼츠 결제위젯 */}
      <div id="payment-widget" className="w-full" />

      {/* 토스페이먼츠 약관 동의 위젯 */}
      <div id="agreement" className="w-full" />

      <Button
        onClick={onPayment}
        disabled={isProcessing || !widgetReady}
        size="lg"
        className="w-full rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
      >
        {isProcessing
          ? "처리 중..."
          : widgetReady
            ? "결제하기"
            : "결제 준비 중..."}
      </Button>
    </div>
  );
}
