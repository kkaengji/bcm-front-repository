"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/user/useAuth";
import HeaderSearch from "./HeaderSearch";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    if (confirm("정말 로그아웃하시겠습니까?")) {
      logout();
    }
  };

  return (
    <>
      <nav className="border-border bg-background sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* 로고 */}
          <Link
            href="/"
            className="text-foreground flex shrink-0 items-center gap-1.5 text-xl font-bold transition-opacity hover:opacity-80 sm:gap-2"
          >
            <Image
              src="/BCM.png"
              alt="BCM 로고"
              width={28}
              height={28}
              className="sm:h-8 sm:w-8"
            />
            <span className="font-logo text-lg sm:text-xl">ㅂㅊㅁ</span>
          </Link>

          {/* 중앙 공간 */}
          <div className="flex-1" />

          {/* 검색바 및 아이콘 영역 */}
          <div className="flex items-center gap-3">
            {/* 로그인/회원가입 영역 */}
            <div className="flex items-center gap-3">
              {/* isLoading: true이면 아무것도 렌더링하지 않음 (깜빡임 방지) */}
              {isLoading ? (
                <div className="bg-muted h-9 w-24 animate-pulse rounded-lg" /> // 스켈레톤 UI
              ) : user ? (
                // --- 로그인 된 상태 ---
                <>
                  {!(pathname?.startsWith("/login") || pathname?.startsWith("/signup")) && (
                    <HeaderSearch />
                  )}
                  <Link
                    href="/mypage"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full p-2 transition-colors"
                    title="마이페이지"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full p-2 transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                // --- 로그아웃 된 상태 ---
                  <>
                  {!(pathname?.startsWith("/login") || pathname?.startsWith("/signup")) && (
                    <HeaderSearch />
                  )}
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full p-2 transition-colors"
                    title="로그인"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
