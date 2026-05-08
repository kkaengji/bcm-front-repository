"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Trophy, Zap, MapPin } from "lucide-react";
import {
  formatCurrency,
  getProductStatusLabel,
  getCategoryNameString,
  getBlindTimeText,
  getTimeRemainMs,
  BLIND_THRESHOLD_MS,
  getTemperatureGrade,
} from "@/lib/utils";
import { TEMPERATURE_GRADES } from "@/lib/constants";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/user/useAuth";
import { useProductDetail } from "@/hooks/useProductDetail";
import { useProductQA } from "@/hooks/useProductQA";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductBidForm } from "@/components/product/ProductBidForm";
import { ProductBidHistory } from "@/components/product/ProductBidHistory";
import { BidHistorySidebar } from "@/components/product/BidHistorySidebar";
import { ProductQA } from "@/components/product/ProductQA";
import WishlistButton from "@/components/common/WishlistButton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCT_STATUS } from "@/lib/constants";

function getSellerLevel(temperature?: number): number {
  if (temperature === undefined) return 1;
  const idx = TEMPERATURE_GRADES.findIndex(
    (g) => g.label === getTemperatureGrade(temperature).label,
  );
  return Math.max(1, idx + 1);
}

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
    handlePrevImage,
    handleNextImage,
    handleBidAmountChange,
    handlePlaceBid,
    isConnected,
    isUsingMockData,
  } = useProductDetail({ params, userEmail: user?.email });

  const [showBidSidebar, setShowBidSidebar] = React.useState(false);

  const { questions, isLoading: qaLoading, isSubmitting: qaSubmitting, submitQuestion, submitAnswer } =
    useProductQA(product?.id ?? 0);

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
            <ChevronLeft className="h-4 w-4" /> 목록으로
          </Link>
          <p className="text-foreground text-center text-xl">
            {error || "상품을 찾을 수 없습니다."}
          </p>
        </div>
      </main>
    );
  }

  const isExpired = checkIsAuctionExpired();
  const blindText = getBlindTimeText(product.bidEndDate);
  const isBlind = !isExpired && getTimeRemainMs(product.bidEndDate) <= BLIND_THRESHOLD_MS;
  const isTopBidder =
    user &&
    product.productBids &&
    product.productBids.length > 0 &&
    product.productBids[0].bidderNickname === user.nickname;
  const hasMyBid =
    user &&
    product.productBids?.some((b) => b.bidderNickname === user.nickname);

  // 상품 ID 기반 결정론적 뷰어 수 (5~15명)
  const viewerCount = ((product.id * 13 + 7) % 11) + 5;

  return (
    <main className="bg-background min-h-screen py-6 sm:py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 뒤로가기 */}
        <Link
          href={`/?page=${page}`}
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> 목록으로
        </Link>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {/* 상품 이미지 갤러리 */}
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

          {/* 입찰 패널 */}
          <div className="rounded-xl bg-card p-4 shadow-lg ring-1 ring-white/5 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* 상품명 + 찜 버튼 */}
              <div className="border-border space-y-2 border-b pb-4 sm:space-y-3 sm:pb-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h1 className="text-foreground text-xl font-bold text-balance sm:text-2xl md:text-3xl">
                      {product.name}
                    </h1>
                  </div>
                  <WishlistButton
                    product={{
                      id: product.id,
                      name: product.name,
                      thumbnail: product.thumbnail || "",
                      bidPrice: product.bidPrice,
                      bidEndDate: product.bidEndDate,
                      bidStatus: product.bidStatus,
                    }}
                    className="shrink-0 mt-1"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* 경매 상태 배지 */}
                  {isExpired || product.bidStatus === "COMPLETED" ? (
                    <Badge variant="secondary" className="w-fit rounded-md px-2 text-xs font-medium">
                      경매 종료
                    </Badge>
                  ) : isBlind ? (
                    <Badge className="w-fit animate-pulse rounded-md border border-bcm-urgent/30 bg-bcm-urgent/15 px-2 text-xs font-semibold text-bcm-urgent">
                      ⚡ 마감 임박
                    </Badge>
                  ) : product.bidStatus === "BIDDED" ? (
                    <Badge className="w-fit rounded-md border border-bcm-live/30 bg-bcm-live/15 px-2 text-xs font-semibold text-bcm-live">
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-bcm-live" />
                      입찰 진행중
                    </Badge>
                  ) : product.bidStatus === "PAYMENT_WAITING" ? (
                    <Badge className="w-fit rounded-md border border-amber-500/30 bg-amber-500/15 px-2 text-xs font-semibold text-amber-500">
                      결제 대기
                    </Badge>
                  ) : product.bidStatus === "NO_BIDDER" ? (
                    <Badge variant="secondary" className="w-fit rounded-md px-2 text-xs font-medium">
                      유찰
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-fit rounded-md px-2 text-xs font-medium">
                      입찰 대기중
                    </Badge>
                  )}
                  {/* 인기 배지 */}
                  {product.bidCount >= 5 && !isExpired && (
                    <Badge className="w-fit rounded-md border border-orange-500/30 bg-orange-500/15 px-2 text-xs font-semibold text-orange-500">
                      🔥 인기
                    </Badge>
                  )}
                </div>
              </div>

              {/* 현재 입찰가 */}
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                  현재 입찰가
                </p>
                <div className="relative overflow-hidden">
                  <motion.p
                    key={priceKey}
                    className="font-price text-foreground text-2xl font-black tabular-nums wrap-break-word sm:text-3xl md:text-4xl"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {formatCurrency(product.bidPrice)}
                  </motion.p>
                  <motion.div
                    key={`flash-${priceKey}`}
                    className="absolute inset-0 rounded-sm bg-primary"
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* 뷰어 수 */}
                {!isExpired && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bcm-live opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-bcm-live" />
                    </span>
                    현재 {viewerCount}명이 보고 있어요
                  </div>
                )}

                {/* 경쟁 심리 배지 */}
                {isTopBidder && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-bcm-live/30 bg-bcm-live/10 px-3 py-1 text-xs font-semibold text-bcm-live"
                  >
                    <Trophy className="h-3 w-3" /> 현재 최고 입찰자
                  </motion.div>
                )}
                {hasMyBid && !isTopBidder && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-bcm-urgent/30 bg-bcm-urgent/10 px-3 py-1 text-xs font-semibold text-bcm-urgent"
                  >
                    <Zap className="h-3 w-3" /> 누군가 당신을 추월했습니다!
                  </motion.div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="border-border space-y-3 border-y py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">남은 시간</span>
                  <span
                    className={`font-medium ${
                      isExpired
                        ? "text-muted-foreground"
                        : isBlind
                          ? "animate-pulse font-bold text-bcm-urgent"
                          : "text-foreground"
                    }`}
                  >
                    {isExpired
                      ? "경매 종료"
                      : isBlind
                        ? "⚡ 마감 임박"
                        : blindText}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground shrink-0">최소 입찰가</span>
                  <span className="font-price text-foreground text-right font-medium tabular-nums break-all">
                    {formatCurrency(minBidValue)}
                  </span>
                </div>
              </div>

              {/* 입찰 폼 */}
              <ProductBidForm
                showForm={showBidForm}
                bidAmount={bidAmount}
                bidError={bidError}
                minBidValue={minBidValue}
                minBidIncrement={minBidIncrement}
                isAuctionExpired={isExpired}
                isOwner={user?.email === product.user.email}
                isLoggedIn={!!user}
                onShowForm={() => setShowBidForm(true)}
                onHideForm={() => setShowBidForm(false)}
                onBidAmountChange={handleBidAmountChange}
                onSubmit={handlePlaceBid}
              />

              {/* 입찰 히스토리 */}
              <ProductBidHistory
                bids={product.productBids}
                bidCount={product.bidCount}
                onOpenSidebar={() => setShowBidSidebar(true)}
                isConnected={isUsingMockData ? undefined : isConnected}
                isAuctionExpired={isExpired}
                currentUserNickname={user?.nickname}
              />
            </div>
          </div>
        </div>

        {/* 상품 정보 / Q&A 탭 */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          <Tabs defaultValue="info">
            <TabsList className="-mb-px h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="info"
                className="mr-8 h-auto flex-none rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3.5 pt-0 text-sm font-semibold text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-primary"
              >
                상품 정보
              </TabsTrigger>
              <TabsTrigger
                value="qa"
                className="h-auto flex-none rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3.5 pt-0 text-sm font-semibold text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-primary"
              >
                상품 Q&amp;A
                {!qaLoading && questions.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                    {questions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 상품 정보 + 설명 */}
                <div className="space-y-6 lg:col-span-2">
                  <dl className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(10rem,1fr))]">
                    {[
                      { label: "카테고리", value: getCategoryNameString(product.category) },
                      { label: "시작가", value: formatCurrency(product.startPrice) },
                      { label: "등록일", value: new Date(product.createdAt).toLocaleDateString("ko-KR") },
                      { label: "상품 상태", value: getProductStatusLabel(product.productStatus, PRODUCT_STATUS) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl border border-border/50 bg-card/50 px-4 py-3.5">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-semibold text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="rounded-xl border border-border/50 bg-card/50 px-5 py-5">
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap sm:text-base">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* 판매자 카드 */}
                <SellerCard user={product.user} />
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-8">
              <ProductQA
                questions={questions}
                isLoading={qaLoading}
                isSubmitting={qaSubmitting}
                isOwner={user?.email === product.user.email}
                isLoggedIn={!!user}
                onSubmitQuestion={submitQuestion}
                onSubmitAnswer={submitAnswer}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 거래 내역 사이드바 */}
      <BidHistorySidebar
        isOpen={showBidSidebar}
        onClose={() => setShowBidSidebar(false)}
        bids={product.productBids ?? []}
        startPrice={product.startPrice}
        productName={product.name}
      />
    </main>
  );
}

interface SellerUser {
  nickname: string;
  temperature?: number;
  location?: string;
}

function SellerCard({ user }: { user: SellerUser }) {
  const level = getSellerLevel(user.temperature);
  const grade = user.temperature !== undefined ? getTemperatureGrade(user.temperature) : null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 px-5 py-5">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        판매자 정보
      </p>
      <div className="flex flex-col items-center gap-3 text-center">
        <Image
          src={`/Lv${level}.png`}
          alt={`Lv${level} 캐릭터`}
          width={72}
          height={72}
          className="object-contain"
        />
        <div>
          <p className="text-base font-bold text-foreground">{user.nickname}</p>
          {grade && (
            <span className={`mt-0.5 inline-block text-sm font-semibold ${grade.color}`}>
              {grade.emoji} {grade.label}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5 border-t border-border/50 pt-4">
        {user.temperature !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">매너 온도</span>
            <span className={`font-semibold ${grade?.color ?? "text-foreground"}`}>
              {user.temperature.toFixed(1)}°C
            </span>
          </div>
        )}
        {user.location && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">활동 지역</span>
            <span className="flex items-center gap-1 font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {user.location}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
