import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-primary font-mono text-8xl font-black tracking-tight">
            404
          </p>
          <div className="bg-border h-px w-full" />
        </div>

        <div className="space-y-3">
          <h1 className="text-foreground text-2xl font-bold">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            요청하신 페이지가 존재하지 않거나
            <br />
            다른 주소로 이동되었습니다.
          </p>
        </div>

        <Button asChild className="gap-2 rounded-lg px-8">
          <Link href="/">
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
      </div>
    </div>
  );
}
