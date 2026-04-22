"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Product, ProductListResponse } from "@/types";
import { apiGet } from "@/lib/api";
import { USE_MOCK_WHEN_EMPTY } from "@/lib/constants";
import mockData from "@/mocks/products.json";

type SortOption =
  | "latest"
  | "price-high"
  | "price-low"
  | "bid-count"
  | "ending-soon"
  | "ended";

const SORT_MAP: Record<SortOption, string> = {
  latest: "createdAt,desc",
  "ending-soon": "bidEndDate,asc",
  "price-high": "bidPrice,desc",
  "price-low": "bidPrice,asc",
  "bid-count": "bidCount,desc",
  ended: "bidEndDate,desc",
};

const ENDED_STATUSES: Product["bidStatus"][] = [
  "COMPLETED",
  "NO_BIDDER",
  "PAYMENT_WAITING",
];

const ACTIVE_STATUSES: Product["bidStatus"][] = ["NOT_BIDDED", "BIDDED"];

export function useInfiniteProducts(
  searchQuery: string = "",
  pageSize: number = 6,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 검색어나 정렬 변경 시 리셋
  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotalItems(0);
  }, [searchQuery, sortBy]);

  // 데이터 로드
  useEffect(() => {
    let ignore = false;

    // Mock 데이터 폴백 로직
    const applyMockDataFallback = (currentPageNum: number) => {
      const all = (mockData as Product[]) ?? [];
      const filteredAll = all.filter((product) =>
        sortBy === "ended"
          ? ENDED_STATUSES.includes(product.bidStatus)
          : ACTIVE_STATUSES.includes(product.bidStatus),
      );
      const startIdx = currentPageNum * pageSize;
      const endIdx = startIdx + pageSize;
      const fallbackProducts = filteredAll.slice(startIdx, endIdx);
      setProducts((prev) =>
        currentPageNum === 0
          ? fallbackProducts
          : [...prev, ...fallbackProducts],
      );
      setTotalItems(filteredAll.length);
      setHasMore(endIdx < filteredAll.length);
    };

    const loadMore = async () => {
      if (loading) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("name", searchQuery.trim());
        params.set("page", String(currentPage));
        params.set("size", String(pageSize));
        params.set("sort", SORT_MAP[sortBy]);
        if (sortBy === "ended") {
          params.set("bidStatus", ENDED_STATUSES.join(","));
        } else {
          params.set("bidStatus", ACTIVE_STATUSES.join(","));
        }

        const data = await apiGet<ProductListResponse>(
          `/api/products?${params.toString()}`,
        );

        if (ignore) return;

        const total = data.totalElements ?? 0;
        const newProducts = data.content ?? [];

        // 서버가 정상 응답했지만 결과가 비어있을 때, (검색어가 없고) 설정에 따라 목데이터 사용
        if (!searchQuery.trim() && total === 0 && USE_MOCK_WHEN_EMPTY) {
          applyMockDataFallback(currentPage);
          return;
        }

        setProducts((prev) => [...prev, ...newProducts]);
        setTotalItems(total);
        setHasMore(currentPage + 1 < (data.totalPages ?? 0));
      } catch (error) {
        if (ignore) return;

        console.error("제품 목록 조회 실패, 목데이터 사용:", error);
        applyMockDataFallback(currentPage);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadMore();

    return () => {
      ignore = true;
    };
  }, [currentPage, pageSize, sortBy, searchQuery]);

  // Intersection Observer 콜백
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore],
  );

  // 언마운트 시 IntersectionObserver 정리
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    products,
    loading,
    sortBy,
    setSortBy,
    hasMore,
    totalItems,
    lastProductRef,
  };
}
