"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductListItem } from "@/components/mypage/ProductListItem";
import ReviewModal from "@/components/mypage/ReviewModal";
import { getStatClass } from "@/lib/utils";

interface ReviewTarget {
  productId: number;
  productName: string;
}

interface SalesHistorySectionProps {
  sellingBidding: Product[];
  sellingPending: Product[];
  sellingCompleted: Product[];
  deliveredProductIds: Set<number>;
  reviewedProductIds: Set<number>;
  onDeliver: (productId: number) => Promise<void>;
  onReviewSuccess: () => void;
}

export default function SalesHistorySection({
  sellingBidding,
  sellingPending,
  sellingCompleted,
  deliveredProductIds,
  reviewedProductIds,
  onDeliver,
  onReviewSuccess,
}: SalesHistorySectionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [deliveringId, setDeliveringId] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  const totalCount =
    sellingBidding.length + sellingPending.length + sellingCompleted.length;

  const handleDeliver = async (productId: number) => {
    setDeliveringId(productId);
    try {
      await onDeliver(productId);
    } finally {
      setDeliveringId(null);
    }
  };

  return (
    <section id="sales" className="mb-10 scroll-mt-24">
      <h2 className="text-foreground mb-4 text-lg font-black sm:text-xl">판매 내역</h2>

      {/* 요약 바 */}
      <div className="mb-6 rounded-xl border border-white/8 bg-card p-4">
        <div className="grid grid-cols-4 text-center text-sm">
          <div className="border-border border-r">
            <p className={getStatClass(totalCount, false, true)}>전체</p>
            <p className={getStatClass(totalCount, false, false)}>{totalCount}</p>
          </div>
          <div>
            <p className={getStatClass(sellingPending.length, true, true)}>결제확인</p>
            <p className={getStatClass(sellingPending.length, true, false)}>{sellingPending.length}</p>
          </div>
          <div>
            <p className={getStatClass(sellingBidding.length, false, true)}>판매중</p>
            <p className={getStatClass(sellingBidding.length, false, false)}>{sellingBidding.length}</p>
          </div>
          <div>
            <p className={getStatClass(sellingCompleted.length, false, true)}>종료</p>
            <p className={getStatClass(sellingCompleted.length, false, false)}>{sellingCompleted.length}</p>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* 결제확인 */}
          <div className="mb-6">
            <h3 className={`mb-3 text-sm font-medium ${sellingPending.length > 0 ? "font-bold text-primary" : "text-muted-foreground"}`}>
              결제확인
            </h3>
            {sellingPending.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                <p className="text-muted-foreground text-sm">결제 확인을 기다리는 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sellingPending.map((product) => (
                  <ProductListItem
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.bidPrice ?? product.startPrice}
                    image={product.thumbnail}
                    subText="구매자 결제 대기 중"
                  />
                ))}
              </div>
            )}
          </div>

          {/* 판매중 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">판매중</h3>
            {sellingBidding.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                <p className="text-muted-foreground text-sm">현재 판매중인 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sellingBidding.map((product) => (
                  <ProductListItem
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.bidPrice ?? product.startPrice}
                    image={product.thumbnail}
                    subText={`전체 입찰 횟수: ${product.bidCount}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 종료 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">종료</h3>
            {sellingCompleted.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                <p className="text-muted-foreground text-sm">종료된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sellingCompleted.map((product) => {
                  const isDelivered = deliveredProductIds.has(product.id);
                  const isReviewed = reviewedProductIds.has(product.id);
                  const isNoBidder = product.bidStatus === "NO_BIDDER";

                  let actionNode: React.ReactNode = undefined;
                  if (!isNoBidder) {
                    if (isDelivered) {
                      actionNode = isReviewed ? (
                        <Badge variant="secondary" className="text-xs">리뷰 완료</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setReviewTarget({ productId: product.id, productName: product.name })
                          }
                        >
                          리뷰 작성
                        </Button>
                      );
                    } else {
                      actionNode = (
                        <Button
                          size="sm"
                          disabled={deliveringId === product.id}
                          onClick={() => handleDeliver(product.id)}
                        >
                          {deliveringId === product.id ? "처리 중..." : "배송완료 처리"}
                        </Button>
                      );
                    }
                  }

                  return (
                    <ProductListItem
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.bidPrice ?? product.startPrice}
                      image={product.thumbnail}
                      subText={isNoBidder ? "유찰" : isDelivered ? "배송 완료" : "결제완료"}
                      actionNode={actionNode}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setShowDetails((prev) => !prev)}
        >
          {showDetails ? "접기" : "더보기"}
        </Button>
      </div>

      {reviewTarget && (
        <ReviewModal
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          reviewType="SELLER_TO_BUYER"
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            setReviewTarget(null);
            onReviewSuccess();
          }}
        />
      )}
    </section>
  );
}
