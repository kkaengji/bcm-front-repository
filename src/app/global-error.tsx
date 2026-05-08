"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="bg-destructive/10 rounded-full p-6">
              <AlertTriangle className="text-destructive h-14 w-14" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-foreground text-2xl font-bold">
              서비스 오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              예기치 못한 오류가 발생했습니다.
              <br />
              불편을 드려 죄송합니다.
            </p>
          </div>

          <Button onClick={reset} className="gap-2 rounded-lg px-8">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        </div>
      </body>
    </html>
  );
}
