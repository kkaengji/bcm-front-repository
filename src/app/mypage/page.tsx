"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/user/useAuth";
import { useMe } from "@/hooks/user/useMe";
import { useUserProfile } from "@/hooks/user/useUserProfile";
import { useProductHistory } from "@/hooks/user/useProductHistory";

// 컴포넌트
import SidebarMenu from "@/components/mypage/SidebarMenu";
import ProfileSection from "@/components/mypage/ProfileSection";
import PurchaseHistorySection from "@/components/mypage/PurchaseHistorySection";
import SalesHistorySection from "@/components/mypage/SalesHistorySection";

export default function MyPage() {
  const router = useRouter();
  const { updateNickname } = useAuth();
  const { data: meData, isLoading: isMeLoading, refetch } = useMe();

  // Custom Hooks
  const {
    user,
    isLoading,
    handleProfileSave: saveProfile,
  } = useUserProfile(meData, isMeLoading);

  // 프로필 저장 후 데이터 새로고침
  const handleProfileSave = async (nickname: string, phoneNumber: string) => {
    await saveProfile(nickname, phoneNumber);
    await refetch(); // 저장 후 최신 데이터 다시 가져오기
  };
  const {
    purchaseBidding,
    paymentPendingOrders,
    completedOrders,
    sellingBidding,
    sellingPending,
    sellingCompleted,
  } = useProductHistory(meData, isMeLoading);

  // 결제하기 핸들러
  const handlePayment = (orderId: number | string, productName: string) => {
    if (!confirm(`'${productName}' 상품의 결제 페이지로 이동하시겠습니까?`))
      return;
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
            />

            {/* === 구매 내역 섹션 === */}
            <PurchaseHistorySection
              purchaseBidding={purchaseBidding}
              paymentPendingOrders={paymentPendingOrders}
              completedOrders={completedOrders}
              onPayment={handlePayment}
            />

            {/* === 판매 내역 섹션 === */}
            <SalesHistorySection
              sellingBidding={sellingBidding}
              sellingPending={sellingPending}
              sellingCompleted={sellingCompleted}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
