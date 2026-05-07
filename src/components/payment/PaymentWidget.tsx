"use client";

import { Button } from "@/components/ui/button";
import { USE_MOCK_API } from "@/lib/constants";

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

      {USE_MOCK_API ? (
        <div className="rounded-lg border border-dashed border-yellow-400 bg-yellow-50 p-6 text-center dark:bg-yellow-950/20">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400">
            데모 모드
          </p>
          <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-500">
            실제 결제가 처리되지 않습니다. 버튼을 누르면 결제 성공으로 처리됩니다.
          </p>
        </div>
      ) : (
        <>
          {/* 토스페이먼츠 결제위젯 */}
          <div id="payment-widget" className="w-full" />
          {/* 토스페이먼츠 약관 동의 위젯 */}
          <div id="agreement" className="w-full" />
        </>
      )}

      <Button
        onClick={onPayment}
        disabled={isProcessing || !widgetReady}
        size="lg"
        className="w-full rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
      >
        {isProcessing
          ? "처리 중..."
          : widgetReady
            ? USE_MOCK_API
              ? "결제하기 (데모)"
              : "결제하기"
            : "결제 준비 중..."}
      </Button>
    </div>
  );
}
