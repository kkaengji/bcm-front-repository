"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/user/useAuth";
import { useMe } from "@/hooks/user/useMe";
import { useUserProfile } from "@/hooks/user/useUserProfile";
import { useProductHistory } from "@/hooks/user/useProductHistory";
import { useWishlist } from "@/hooks/useWishlist";
import { useReview } from "@/hooks/useReview";
import { apiGet, apiPost } from "@/lib/api";

// 컴포넌트
import SidebarMenu from "@/components/mypage/SidebarMenu";
import ProfileSection from "@/components/mypage/ProfileSection";
import PurchaseHistorySection from "@/components/mypage/PurchaseHistorySection";
import SalesHistorySection from "@/components/mypage/SalesHistorySection";
import WishlistSection from "@/components/mypage/WishlistSection";

export default function MyPage() {
  const router = useRouter();
  const { updateNickname } = useAuth();
  const { data: meData, isLoading: isMeLoading, refetch } = useMe();
  const { count: wishlistCount } = useWishlist();
  const { isReviewed } = useReview();

  // 배송완료 상태 (productId Set)
  const [deliveredProductIds, setDeliveredProductIds] = useState<Set<number>>(new Set());
  // 리뷰 완료 상태 (productId Set — 구매/판매 각각 다른 reviewType이지만 UI 단에선 productId로 관리)
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<number>>(new Set());

  // Custom Hooks
  const {
    user,
    isLoading,
    handleProfileSave: saveProfile,
  } = useUserProfile(meData, isMeLoading);

  const handleProfileSave = async (
    nickname: string,
    phoneNumber: string,
    profileImageFile?: File | null,
    address?: string,
    detailAddress?: string,
    zipCode?: string,
  ) => {
    await saveProfile(nickname, phoneNumber, profileImageFile, address, detailAddress, zipCode);
    await refetch();
  };

  const {
    purchaseBidding,
    paymentPendingOrders,
    completedOrders,
    sellingBidding,
    sellingPending,
    sellingCompleted,
  } = useProductHistory(meData, isMeLoading);

  // 세션의 배송완료 목록을 서버에서 가져오기
  const fetchDeliveredIds = useCallback(async () => {
    try {
      const res = await apiGet<{ deliveredProductIds: number[] }>("/api/reviews/delivered-ids");
      if (res?.deliveredProductIds) {
        setDeliveredProductIds(new Set(res.deliveredProductIds));
      }
    } catch {
      // mock 또는 API 미지원 시 무시
    }
  }, []);

  useEffect(() => {
    fetchDeliveredIds();
  }, [fetchDeliveredIds]);

  // 배송완료 처리
  const handleDeliver = async (productId: number) => {
    await apiPost(`/api/products/${productId}/delivered`, {});
    setDeliveredProductIds((prev) => new Set([...prev, productId]));
  };

  // 리뷰 성공 후 상태 갱신
  const handleReviewSuccess = useCallback(async () => {
    // 리뷰 완료 목록을 서버에서 재확인하거나, 낙관적으로 업데이트
    // 여기서는 refetch로 rating 반영
    await refetch();
    // 배송완료 목록도 재조회
    fetchDeliveredIds();
  }, [refetch, fetchDeliveredIds]);

  // 리뷰 완료 여부 확인 (completedOrders의 productId 기준)
  useEffect(() => {
    if (completedOrders.length === 0 && sellingCompleted.length === 0) return;

    const checkAll = async () => {
      const ids = new Set<number>();
      const productIds = [
        ...completedOrders.map((o) => o.product?.id).filter(Boolean) as number[],
        ...sellingCompleted.map((p) => p.id),
      ];
      await Promise.all(
        productIds.map(async (pid) => {
          const buyerReviewed = await isReviewed(pid, "BUYER_TO_SELLER");
          const sellerReviewed = await isReviewed(pid, "SELLER_TO_BUYER");
          if (buyerReviewed || sellerReviewed) ids.add(pid);
        }),
      );
      setReviewedProductIds(ids);
    };
    checkAll();
  }, [completedOrders, sellingCompleted, isReviewed]);

  // 결제하기 핸들러
  const handlePayment = (orderId: number | string, productName: string) => {
    if (!confirm(`'${productName}' 상품의 결제 페이지로 이동하시겠습니까?`)) return;
    router.push(`/payment/${orderId}`);
  };

  return (
    <main className="bg-background min-h-screen py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* === 왼쪽 사이드바 === */}
          <SidebarMenu />

          {/* === 메인 콘텐츠 === */}
          <div className="min-w-0 flex-1">
            {/* === 프로필 섹션 === */}
            <ProfileSection
              user={user}
              isLoading={isLoading}
              onSave={handleProfileSave}
              onUpdateNickname={updateNickname}
              stats={{
                totalBids: meData?.productBids?.length ?? 0,
                selling: sellingBidding.length,
                completed: completedOrders.length,
                wishlisted: wishlistCount,
              }}
            />

            {/* === 구매 내역 섹션 === */}
            <PurchaseHistorySection
              purchaseBidding={purchaseBidding}
              paymentPendingOrders={paymentPendingOrders}
              completedOrders={completedOrders}
              deliveredProductIds={deliveredProductIds}
              reviewedProductIds={reviewedProductIds}
              onPayment={handlePayment}
              onReviewSuccess={handleReviewSuccess}
            />

            {/* === 판매 내역 섹션 === */}
            <SalesHistorySection
              sellingBidding={sellingBidding}
              sellingPending={sellingPending}
              sellingCompleted={sellingCompleted}
              deliveredProductIds={deliveredProductIds}
              reviewedProductIds={reviewedProductIds}
              onDeliver={handleDeliver}
              onReviewSuccess={handleReviewSuccess}
            />

            {/* === 찜한 상품 섹션 === */}
            <section id="wishlist" className="scroll-mt-20">
              <h2 className="text-foreground mb-4 text-lg font-black sm:mb-6 sm:text-xl">
                찜한 상품
              </h2>
              <WishlistSection />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
