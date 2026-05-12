"use client";

import { useState } from "react";
import type { MypageProductBid, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductListItem } from "@/components/mypage/ProductListItem";
import ReviewModal from "@/components/mypage/ReviewModal";
import { getStatClass } from "@/lib/utils";

interface ReviewTarget {
  productId: number;
  productName: string;
}

interface PurchaseHistorySectionProps {
  purchaseBidding: MypageProductBid[];
  paymentPendingOrders: Order[];
  completedOrders: Order[];
  deliveredProductIds: Set<number>;
  reviewedProductIds: Set<number>;
  onPayment: (orderId: number | string, productName: string) => void;
  onReviewSuccess: () => void;
}

export default function PurchaseHistorySection({
  purchaseBidding,
  paymentPendingOrders,
  completedOrders,
  deliveredProductIds,
  reviewedProductIds,
  onPayment,
  onReviewSuccess,
}: PurchaseHistorySectionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  const totalCount =
    purchaseBidding.length +
    paymentPendingOrders.length +
    completedOrders.length;

  return (
    <section id="purchase" className="mb-10 scroll-mt-24">
      <h2 className="text-foreground mb-4 text-lg font-black sm:text-xl">구매 내역</h2>

      {/* 요약바 */}
      <div className="mb-6 rounded-xl border border-white/8 bg-card p-4">
        <div className="grid grid-cols-2 gap-y-4 text-center text-sm sm:grid-cols-4 sm:gap-y-0">
          <div className="border-border border-r">
            <p className={getStatClass(totalCount, false, true)}>전체</p>
            <p className={getStatClass(totalCount, false, false)}>{totalCount}</p>
          </div>
          <div className="sm:border-border sm:border-r">
            <p className={getStatClass(paymentPendingOrders.length, true, true)}>결제대기</p>
            <p className={getStatClass(paymentPendingOrders.length, true, false)}>{paymentPendingOrders.length}</p>
          </div>
          <div className="border-border border-r">
            <p className={getStatClass(purchaseBidding.length, false, true)}>입찰중</p>
            <p className={getStatClass(purchaseBidding.length, false, false)}>{purchaseBidding.length}</p>
          </div>
          <div>
            <p className={getStatClass(completedOrders.length, false, true)}>종료</p>
            <p className={getStatClass(completedOrders.length, false, false)}>{completedOrders.length}</p>
          </div>
        </div>
      </div>

      {(showDetails || paymentPendingOrders.length > 0) && (
        <>
          {/* 결제 대기 */}
          <div className="mb-8">
            <h3 className={`mb-3 text-sm font-medium ${paymentPendingOrders.length > 0 ? "font-bold text-primary" : "text-muted-foreground"}`}>
              결제대기
            </h3>
            {paymentPendingOrders.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                <p className="text-muted-foreground text-sm">결제 대기 중인 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentPendingOrders.map((order) => (
                  <ProductListItem
                    key={order.orderId}
                    id={order.product?.id || order.orderId}
                    name={order.productName}
                    price={order.bidPrice}
                    image={order.thumbnail || order.imageUrls?.[0]?.imageUrl}
                    subText="낙찰 성공! 결제 대기 중"
                    actionNode={
                      <Button size="sm" onClick={() => onPayment(order.orderId, order.productName)}>
                        결제하기
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {showDetails && (
            <>
              {/* 입찰중 */}
              <div className="mb-6">
                <h3 className="text-muted-foreground mb-3 text-sm font-medium">입찰중</h3>
                {purchaseBidding.length === 0 ? (
                  <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                    <p className="text-muted-foreground text-sm">현재 입찰 진행중인 상품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {purchaseBidding.map((product) => (
                      <ProductListItem
                        key={product.productId}
                        id={product.productId}
                        name={product.productName}
                        price={product.price}
                        image={product.thumbnail || product.imageUrls?.[0]?.imageUrl}
                        subText={`내 입찰 횟수: ${product.bidCount}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 종료 */}
              <div>
                <h3 className="text-muted-foreground mb-3 text-sm font-medium">종료</h3>
                {completedOrders.length === 0 ? (
                  <div className="rounded-xl border border-white/8 bg-card py-8 text-center">
                    <p className="text-muted-foreground text-sm">종료된 상품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {completedOrders.map((order) => {
                      const productId = order.product?.id;
                      const isDelivered = productId !== undefined && deliveredProductIds.has(productId);
                      const isReviewed = productId !== undefined && reviewedProductIds.has(productId);

                      let subText = "결제 완료";
                      if (order.orderStatus === "DELIVERED" || isDelivered) subText = "배송 완료";
                      else if (order.orderStatus === "EXPIRED") subText = "기간 만료";

                      const actionNode = isDelivered ? (
                        isReviewed ? (
                          <Badge variant="secondary" className="text-xs">리뷰 완료</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setReviewTarget({
                                productId: productId!,
                                productName: order.productName,
                              })
                            }
                          >
                            리뷰 작성
                          </Button>
                        )
                      ) : undefined;

                      return (
                        <ProductListItem
                          key={order.orderId}
                          id={order.product?.id || order.orderId}
                          name={order.productName}
                          price={order.bidPrice}
                          image={order.thumbnail || order.imageUrls?.[0]?.imageUrl}
                          subText={subText}
                          actionNode={actionNode}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
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
          reviewType="BUYER_TO_SELLER"
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
