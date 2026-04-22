"use client";

import { useState, useEffect } from "react";
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

// 정렬 옵션을 서버 정렬 쿼리로 매핑
// Record 타입 사용으로 모든 SortOption에 대한 매핑을 강제하여 타입 안정성 확보
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

export function useProducts(
  searchQuery: string = "",
  pageSize: number = 6,
  initialPage: number = 0,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    initialPage >= 0 ? initialPage : -1,
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // URL 페이지 파라미터 변경 시 currentPage 동기화
  useEffect(() => {
    if (initialPage >= 0 && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage, currentPage]);

  // 검색어 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // 서버 페이지네이션 기반으로 데이터 가져오기
  useEffect(() => {
    // 유효한 페이지 번호가 설정될 때까지 요청 보류
    if (currentPage < 0) return;

    let ignore = false;

    // Mock 데이터 폴백 로직
    const applyMockDataFallback = (pageNum: number) => {
      const all = (mockData as Product[]) ?? [];
      const filteredAll = all.filter((product) =>
        sortBy === "ended"
          ? ENDED_STATUSES.includes(product.bidStatus)
          : ACTIVE_STATUSES.includes(product.bidStatus),
      );
      const startIdx = pageNum * pageSize;
      const endIdx = startIdx + pageSize;
      const pageSlice = filteredAll.slice(startIdx, endIdx);
      setProducts(pageSlice);
      setTotalPages(Math.ceil(filteredAll.length / pageSize));
      setTotalItems(filteredAll.length);
    };

    const fetchPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        // condition
        if (searchQuery.trim()) params.set("name", searchQuery.trim());
        // pageable
        params.set("page", String(currentPage));
        params.set("size", String(pageSize));
        params.set("sort", SORT_MAP[sortBy]);

        // 종료된 상품 필터
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
        const list = data.content ?? [];

        // 서버가 정상 응답했지만 결과가 비어있을 때, (검색어가 없고) 설정에 따라 목데이터 사용
        if (!searchQuery.trim() && total === 0 && USE_MOCK_WHEN_EMPTY) {
          applyMockDataFallback(currentPage);
          return;
        }

        setProducts(list);
        setTotalPages(data.totalPages ?? 0);
        setTotalItems(total);
      } catch (error) {
        console.error("제품 목록 조회 실패, 목데이터 사용:", error);
        applyMockDataFallback(currentPage);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPage();
    return () => {
      ignore = true;
    };
  }, [searchQuery, sortBy, currentPage, pageSize]);

  return {
    products,
    loading,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  };
}
