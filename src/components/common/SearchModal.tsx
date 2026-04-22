"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      onClose();
      setSearchQuery("");
    } else {
      router.push("/");
      setSearchQuery("");
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20">
      {/* 모달 내용 */}
      <div className="bg-background relative w-full max-w-2xl rounded-lg shadow-2xl">
        {/* 헤더 영역 */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">상품 검색</h2>
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 검색 폼 */}
        <div className="p-6">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="어떤 상품을 찾으시나요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="text-foreground placeholder-muted-foreground border-border focus:ring-primary w-full rounded-lg border bg-transparent py-4 pr-4 pl-12 text-lg transition-all focus:ring-2 focus:outline-none"
              />
            </div>

            {/* 검색 버튼 */}
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-lg py-3 font-medium transition-colors"
            >
              검색
            </button>
          </form>

          {/* 안내 문구 */}
          <div className="text-muted-foreground mt-6 text-center text-sm">
            <p>상품명으로 검색해보세요</p>
          </div>
        </div>
      </div>

      {/* 배경 클릭시 닫기 */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />
    </div>
  );
}
