"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function FailurePage() {
  const failureReason = "카드 승인 거절";

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="bg-card border-border space-y-8 rounded-lg border p-8 text-center sm:p-12">
          {/* Failure Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              결제가 실패했습니다
            </h1>
            <p className="text-muted-foreground">
              죄송합니다. 결제 처리 중 문제가 발생했습니다.
            </p>
          </div>

          {/* Error Details */}
          <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 text-left">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-900">
                결제 실패 사유
              </p>
              <p className="text-sm text-red-800">{failureReason}</p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>다시 시도해보세요:</strong>
              <br />• 카드 정보가 정확하게 입력되었는지 확인해주세요.
              <br />• 다른 결제 방법을 시도해주세요.
              <br />• 카드사에 문의해 거절 사유를 확인해주세요.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Link href="/checkout" className="flex-1">
              <Button className="flex w-full items-center justify-center gap-2 rounded-lg">
                <RefreshCw className="h-4 w-4" />
                다시 결제하기
              </Button>
            </Link>
            <Link href="/profile" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-lg bg-transparent"
              >
                주문 조회
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-lg bg-transparent"
              >
                홈으로
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="bg-card border-border space-y-4 rounded-lg border p-6">
            <h3 className="text-foreground font-semibold">
              계속 문제가 발생하시나요?
            </h3>
            <p className="text-muted-foreground text-sm">
              기술 지원팀에 문의하시거나 다른 결제 방법을 시도해보세요.
            </p>
            <Button
              variant="outline"
              className="w-full rounded-lg bg-transparent"
            >
              고객 지원팀 연락하기
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
