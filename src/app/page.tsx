"use client";

import { Suspense, useMemo, useCallback, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import HeroSection from "@/components/home/HeroSection";
import ProductsHeader from "@/components/home/ProductsHeader";
import ProductsGrid from "@/components/home/ProductsGrid";
import InfiniteProductsGrid from "@/components/home/InfiniteProductsGrid";
import Pagination from "@/components/home/Pagination";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const pageParam = useMemo(() => {
    const raw = searchParams.get("page");
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(n) ? 0 : Math.max(n, 0);
  }, [searchParams]);

  // 모바일 여부 감지
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 데스크톱: 페이지네이션
  const paginatedData = useProducts(searchQuery, 6, pageParam);

  // 모바일: 무한 스크롤
  const infiniteData = useInfiniteProducts(searchQuery, 6);

  // 현재 모드에 따라 데이터 선택
  const { products, loading, sortBy, setSortBy, totalItems } = isMobile
    ? {
        products: infiniteData.products,
        loading: infiniteData.loading,
        sortBy: infiniteData.sortBy,
        setSortBy: infiniteData.setSortBy,
        totalItems: infiniteData.totalItems,
      }
    : {
        products: paginatedData.products,
        loading: paginatedData.loading,
        sortBy: paginatedData.sortBy,
        setSortBy: paginatedData.setSortBy,
        totalItems: paginatedData.totalItems,
      };

  // 페이지 변경 시 URL 업데이트 (currentPage는 URL 변경 감지로 자동 동기화)
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.push(`/?${params.toString()}`);
    },
    [searchParams, router],
  );

  return (
    <main className="bg-background min-h-screen">
      <HeroSection />

      <section className="py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductsHeader
            searchQuery={searchQuery}
            totalItems={totalItems}
            displayedCount={products.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isMobile === null ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : isMobile ? (
            <InfiniteProductsGrid
              products={infiniteData.products}
              loading={infiniteData.loading}
              searchQuery={searchQuery}
              lastProductRef={infiniteData.lastProductRef}
              hasMore={infiniteData.hasMore}
              pageSize={6}
            />
          ) : (
            <>
              <ProductsGrid
                products={paginatedData.products}
                loading={paginatedData.loading}
                searchQuery={searchQuery}
                currentPage={paginatedData.currentPage}
              />

              <Pagination
                currentPage={paginatedData.currentPage}
                totalPages={paginatedData.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="bg-background min-h-screen">
      <HeroSection />
      <section className="py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
