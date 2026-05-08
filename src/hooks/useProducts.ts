"use client";

import { useState, useEffect } from "react";
import { Product, ProductListResponse } from "@/types";
import { apiGet } from "@/lib/api";
import { USE_MOCK_WHEN_EMPTY } from "@/lib/constants";
import mockData from "@/mocks/products.json";

type SortOption = "latest" | "price-high" | "price-low" | "bid-count" | "ending-soon";

const SORT_MAP: Record<SortOption, string> = {
  latest: "createdAt,desc",
  "ending-soon": "bidEndDate,asc",
  "price-high": "bidPrice,desc",
  "price-low": "bidPrice,asc",
  "bid-count": "bidCount,desc",
};

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
      const filteredAll = all;
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
