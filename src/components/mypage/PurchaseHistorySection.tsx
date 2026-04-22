"use client";

import { useState } from "react";
import type { MypageProductBid, Order } from "@/types";
import { Button } from "@/components/ui/button";
import { ProductListItem } from "@/components/mypage/ProductListItem";
import { getStatClass } from "@/lib/utils";

interface PurchaseHistorySectionProps {
  purchaseBidding: MypageProductBid[];
  paymentPendingOrders: Order[];
  completedOrders: Order[];
  onPayment: (orderId: number | string, productName: string) => void;
}

export default function PurchaseHistorySection({
  purchaseBidding,
  paymentPendingOrders,
  completedOrders,
  onPayment,
}: PurchaseHistorySectionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const totalCount =
    purchaseBidding.length +
    paymentPendingOrders.length +
    completedOrders.length;

  return (
    <section id="purchase" className="mb-10 scroll-mt-24">
      <h2 className="mb-4 text-lg font-semibold">구매 내역</h2>

      {/* 요약바 */}
      <div className="border-border bg-card mb-6 rounded-lg border p-4">
        <div className="grid grid-cols-4 text-center text-sm">
          <div className="border-border border-r">
            <p className={getStatClass(totalCount, false, true)}>전체</p>
            <p className={getStatClass(totalCount, false, false)}>
              {totalCount}
            </p>
          </div>

          <div>
            <p className={getStatClass(purchaseBidding.length, false, true)}>
              입찰중
            </p>
            <p className={getStatClass(purchaseBidding.length, false, false)}>
              {purchaseBidding.length}
            </p>
          </div>

          <div>
            <p
              className={getStatClass(paymentPendingOrders.length, true, true)}
            >
              결제대기
            </p>
            <p
              className={getStatClass(paymentPendingOrders.length, true, false)}
            >
              {paymentPendingOrders.length}
            </p>
          </div>

          <div>
            <p className={getStatClass(completedOrders.length, false, true)}>
              종료
            </p>
            <p className={getStatClass(completedOrders.length, false, false)}>
              {completedOrders.length}
            </p>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* 진행중인 목록 */}
          <div className="mb-6">
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              입찰중
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {purchaseBidding.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    현재 입찰 진행중인 상품이 없습니다.
                  </p>
                </div>
              ) : (
                purchaseBidding.map((product) => (
                  <ProductListItem
                    key={product.productId}
                    id={product.productId}
                    name={product.productName}
                    price={product.price}
                    image={
                      product.thumbnail || product.imageUrls?.[0]?.imageUrl
                    }
                    subText={`내 입찰 횟수: ${product.bidCount}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* 결제 대기 목록 */}
          <div className="mb-8">
            <h3
              className={`mb-3 text-sm font-medium ${
                paymentPendingOrders.length > 0
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
              }`}
            >
              결제대기
            </h3>
            <div
              className={`rounded-lg border ${
                paymentPendingOrders.length > 0
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {paymentPendingOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    결제 대기 중인 상품이 없습니다.
                  </p>
                </div>
              ) : (
                paymentPendingOrders.map((order) => (
                  <ProductListItem
                    key={order.orderId}
                    id={order.product?.id || order.orderId}
                    name={order.productName}
                    price={order.bidPrice}
                    image={order.thumbnail || order.imageUrls?.[0]?.imageUrl}
                    subText="낙찰 성공! 결제 대기 중"
                    actionNode={
                      <Button
                        size="sm"
                        onClick={() =>
                          onPayment(order.orderId, order.productName)
                        }
                      >
                        결제하기
                      </Button>
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* 종료 목록 */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              종료
            </h3>
            <div className="border-border bg-card rounded-lg border">
              {completedOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    종료된 상품이 없습니다.
                  </p>
                </div>
              ) : (
                completedOrders.map((order) => (
                  <ProductListItem
                    key={order.orderId}
                    id={order.orderId}
                    name={order.productName}
                    price={order.bidPrice}
                    image={order.thumbnail || order.imageUrls?.[0]?.imageUrl}
                    subText={
                      order.orderStatus === "PAID"
                        ? "결제 완료"
                        : order.orderStatus === "EXPIRED"
                          ? "기간 만료"
                          : "종료"
                    }
                  />
                ))
              )}
            </div>
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
    </section>
  );
}
