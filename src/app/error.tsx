"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-14 w-14 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-foreground text-2xl font-bold">
            문제가 발생했습니다
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            일시적인 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="bg-destructive/10 text-destructive/80 mt-2 rounded-lg px-3 py-2 font-mono text-xs">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2 rounded-lg">
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
          <Button variant="outline" asChild className="gap-2 rounded-lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
