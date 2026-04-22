"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  getProductStatusLabel,
  getBidStatusLabel,
  getCategoryNameString,
} from "@/lib/utils";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/user/useAuth";
import { useProductDetail } from "@/hooks/useProductDetail";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductBidForm } from "@/components/product/ProductBidForm";
import { ProductBidHistory } from "@/components/product/ProductBidHistory";

import { PRODUCT_STATUS, BID_STATUS } from "@/lib/constants";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "0";
  const { user } = useAuth();

  const {
    product,
    isLoading,
    error,
    bidAmount,
    showBidForm,
    setShowBidForm,
    priceKey,
    showAllBids,
    setShowAllBids,
    bidError,
    currentImageIndex,
    setCurrentImageIndex,
    minBidIncrement,
    minBidValue,
    checkIsAuctionExpired,
    getTimeRemaining,
    handlePrevImage,
    handleNextImage,
    handleBidAmountChange,
    handlePlaceBid,
  } = useProductDetail({ params, userEmail: user?.email });

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <main className="bg-background min-h-screen py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/?page=${page}`}
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
          <p className="text-foreground text-center text-xl">
            {error || "상품을 찾을 수 없습니다."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen py-6 sm:py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Product Image Gallery */}
          <div className="lg:col-span-2">
            <ProductImageGallery
              images={product.imageUrls}
              productName={product.name}
              currentIndex={currentImageIndex}
              onPrevious={handlePrevImage}
              onNext={handleNextImage}
              onSelectIndex={setCurrentImageIndex}
            />
          </div>

          {/* Bidding Panel */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border-border space-y-2 border-b pb-4 sm:space-y-3 sm:pb-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h1 className="text-foreground text-xl font-bold text-balance sm:text-2xl md:text-3xl">
                    {product.name}
                  </h1>
                  <p className="text-muted-foreground mt-1.5 text-xs sm:mt-2 sm:text-sm">
                    {product.user.nickname}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="w-fit text-xs">
                  {getBidStatusLabel(product.bidStatus, BID_STATUS)}
                </Badge>
                <Badge variant="outline" className="w-fit text-xs">
                  {getProductStatusLabel(product.productStatus, PRODUCT_STATUS)}
                </Badge>
              </div>
            </div>

            {/* Current Bid Section */}
            <div className="space-y-1.5 overflow-hidden sm:space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                현재 입찰가
              </p>
              <motion.p
                key={priceKey}
                className="text-foreground text-2xl font-bold wrap-break-word sm:text-3xl md:text-4xl"
                initial={{ scale: 1, color: "#09090b" }}
                animate={{
                  scale: [1, 1.1, 1],
                  color: ["#09090b", "#ff1100", "#09090b"],
                }}
                transition={{ duration: 0.3 }}
              >
                {formatCurrency(product.bidPrice)}
              </motion.p>
            </div>

            {/* Item Info Grid */}
            <div className="border-border space-y-3 border-y py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">카테고리</span>
                <span className="text-foreground font-medium">
                  {getCategoryNameString(product.category)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">남은 시간</span>
                <span
                  className={`font-medium ${
                    getTimeRemaining() === "경매가 곧 마감됩니다"
                      ? "font-bold text-red-500"
                      : "text-foreground"
                  }`}
                >
                  {getTimeRemaining() || "경매 종료"}
                </span>
              </div>
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">
                  최소 입찰가
                </span>
                <span className="text-foreground text-right font-medium break-all">
                  {formatCurrency(minBidValue)}
                </span>
              </div>
            </div>

            {/* Bid Input */}
            <ProductBidForm
              showForm={showBidForm}
              bidAmount={bidAmount}
              bidError={bidError}
              minBidValue={minBidValue}
              minBidIncrement={minBidIncrement}
              isAuctionExpired={checkIsAuctionExpired()}
              isOwner={user?.email === product.user.email}
              isLoggedIn={!!user}
              onShowForm={() => setShowBidForm(true)}
              onHideForm={() => setShowBidForm(false)}
              onBidAmountChange={handleBidAmountChange}
              onSubmit={handlePlaceBid}
            />

            {/* Bid History */}
            <ProductBidHistory
              bids={product.productBids}
              bidCount={product.bidCount}
              showAll={showAllBids}
              onToggleShow={() => setShowAllBids(!showAllBids)}
              maxVisible={5}
              collapsedCount={1}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-8 md:mt-12 md:gap-12">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-foreground text-xl font-bold sm:text-2xl">
              상세 설명
            </h2>
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap sm:text-base">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
