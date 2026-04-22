import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch } from "@/lib/api";
import type { OrderDetail, UpdateShippingInfoRequest, User } from "@/types";

export interface WinningProduct {
  id: number;
  title: string;
  orderNumber: string;
  image: string;
  winningBid: number;
  seller: string;
  estimatedDelivery: string;
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  postalCode: string;
}

interface UsePaymentOrderReturn {
  orderId: number;
  winningProduct: WinningProduct;
  deliveryInfo: DeliveryInfo;
  isLoading: boolean;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  updateShippingInfo: (info: DeliveryInfo) => Promise<void>;
}

/**
 * 결제 페이지의 주문 데이터를 관리하는 훅
 * - 주문 정보 조회
 * - 배송 정보 초기화 및 업데이트
 */
export function usePaymentOrder(
  orderId: number,
  authLoading: boolean,
  user: User | null,
): UsePaymentOrderReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [winningProduct, setWinningProduct] = useState<WinningProduct>({
    id: 0,
    title: "",
    orderNumber: "",
    image: "",
    winningBid: 0,
    seller: "",
    estimatedDelivery: "3-5 영업일",
  });
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
    postalCode: "",
  });

  useEffect(() => {
    const initializeOrder = async () => {
      // 인증 로딩 중이면 대기
      if (authLoading) return;

      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      if (!user) {
        alert("로그인이 필요한 서비스입니다.");
        router.push("/login");
        return;
      }

      if (!orderId) return;

      try {
        setIsLoading(true);
        // API 호출로 주문 정보 가져오기
        const orderData = await apiGet<OrderDetail>(`/api/orders/${orderId}`);

        // API 응답에서 필요한 정보만 추출
        setWinningProduct({
          id: orderData.product.id,
          title: orderData.product.name,
          orderNumber: orderData.orderNumber,
          image: orderData.product.imageUrls[0]?.imageUrl || "",
          winningBid: orderData.bidPrice,
          seller: orderData.product.user.nickname,
          estimatedDelivery: "3-5 영업일",
        });

        // 배송 정보가 있으면 미리 채워넣기
        if (orderData.shippingInfo) {
          setDeliveryInfo({
            name: orderData.shippingInfo.name,
            phone: orderData.shippingInfo.phoneNumber,
            address: orderData.shippingInfo.address,
            detailAddress: orderData.shippingInfo.detailAddress,
            postalCode: orderData.shippingInfo.zipCode,
          });
        }
      } catch (error) {
        console.error("주문 정보 조회 실패:", error);
        // 권한 없음 또는 존재하지 않는 주문일 경우
        if (
          error instanceof Error &&
          (error.message.includes("403") ||
            error.message.includes("404") ||
            error.message.includes("권한") ||
            error.message.includes("엔티티를 찾을 수 없습니다"))
        ) {
          alert("접근 권한이 없거나 존재하지 않는 주문입니다.");
          router.push("/");
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrder();
  }, [orderId, authLoading, user, router]);

  const updateShippingInfo = async (info: DeliveryInfo) => {
    const shippingData: UpdateShippingInfoRequest = {
      name: info.name,
      phoneNumber: info.phone,
      zipCode: info.postalCode,
      address: info.address,
      detailAddress: info.detailAddress,
    };

    await apiPatch<OrderDetail>(
      `/api/orders/${orderId}/shipping-info`,
      shippingData,
    );
  };

  return {
    orderId,
    winningProduct,
    deliveryInfo,
    isLoading,
    setDeliveryInfo,
    updateShippingInfo,
  };
}
