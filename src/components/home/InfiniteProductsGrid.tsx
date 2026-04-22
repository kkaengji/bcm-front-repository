import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Product } from "@/types";

interface InfiniteProductsGridProps {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  lastProductRef: (node: HTMLDivElement | null) => void;
  hasMore: boolean;
  pageSize?: number;
}

export default function InfiniteProductsGrid({
  products,
  loading,
  searchQuery,
  lastProductRef,
  hasMore,
  pageSize = 6,
}: InfiniteProductsGridProps) {
  if (products.length === 0 && !loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">
          {searchQuery ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? lastProductRef : null}
        >
          <ProductCard product={product} currentPage={0} />
        </div>
      ))}

      {loading && (
        <>
          {Array.from({ length: pageSize }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </>
      )}

      {!hasMore && products.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            모든 상품을 불러왔습니다.
          </p>
        </div>
      )}
    </div>
  );
}
