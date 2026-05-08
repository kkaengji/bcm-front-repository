"use client";

import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Product } from "@/types";
import { motion } from "framer-motion";

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  currentPage: number;
}

export default function ProductsGrid({
  products,
  loading,
  searchQuery,
  currentPage,
}: ProductsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">
          {searchQuery ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
        >
          <ProductCard
            product={product}
            currentPage={currentPage}
          />
        </motion.div>
      ))}
    </div>
  );
}
