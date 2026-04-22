"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/user/useAuth";
import { usePaymentOrder } from "@/hooks/payment/usePaymentOrder";
import { useTossPayments } from "@/hooks/payment/useTossPayments";
import { normalizeError, formatUserMessage } from "@/lib/errors";
import ShippingForm from "@/components/payment/ShippingForm";
import PaymentWidget from "@/components/payment/PaymentWidget";
import PaymentSummary from "@/components/payment/PaymentSummary";
import OrderSkeleton from "@/components/payment/OrderSkeleton";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  const { user, isLoading: authLoading } = useAuth();
  const [resolvedOrderId, setResolvedOrderId] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // params 해석
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      const id = parseInt(resolved.orderId, 10);
      setResolvedOrderId(id);
    };
    resolveParams();
  }, [params]);

  // 주문 데이터 조회
  const {
    orderId,
    winningProduct,
    deliveryInfo,
    isLoading,
    setDeliveryInfo,
    updateShippingInfo,
  } = usePaymentOrder(resolvedOrderId, authLoading, user);

  // // 결제 금액 계산
  // const { shippingFee, tax, totalAmount } = usePaymentCalculation(
  //   winningProduct.winningBid,
  // );

  // 토스페이먼츠 위젯 관리
  // isLoading이 false이고 orderId가 있을 때만 초기화
  const { widgetReady, requestPayment } = useTossPayments(
    orderId,
    winningProduct.winningBid,
    !isLoading && orderId > 0,
  );

  // 주소 찾기 완료 핸들러
  const handleAddressComplete = (data: {
    zonecode: string;
    address: string;
  }) => {
    setDeliveryInfo({
      ...deliveryInfo,
      postalCode: data.zonecode,
      address: data.address,
    });
    // 주소 관련 에러 메시지 제거
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.postalCode;
      delete newErrors.address;
      return newErrors;
    });
    setIsOpen(false);
  };

  const validateDeliveryInfo = () => {
    const newErrors: Record<string, string> = {};
    const phoneDigits = deliveryInfo.phone.replace(/\D/g, "");

    if (!deliveryInfo.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.phone = "전화번호 형식을 확인해주세요 (숫자 10~11자리)";
    }
    if (!deliveryInfo.address.trim()) newErrors.address = "주소를 입력해주세요";
    if (!deliveryInfo.detailAddress.trim())
      newErrors.detailAddress = "상세주소를 입력해주세요";
    if (!deliveryInfo.postalCode.trim()) {
      newErrors.postalCode = "우편번호를 입력해주세요";
    } else if (deliveryInfo.postalCode.replace(/\D/g, "").length < 5) {
      newErrors.postalCode = "우편번호 5자리를 입력해주세요";
    }

    return newErrors;
  };

  // 배송 정보 입력 핸들러
  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo({ ...deliveryInfo, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 주문 완료 핸들러
  const handleCompleteOrder = async () => {
    const newErrors = validateDeliveryInfo();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGlobalError("입력값을 다시 확인해 주세요.");
      return;
    }

    if (!widgetReady) {
      setGlobalError(
        "결제 위젯이 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }

    setIsProcessing(true);
    setGlobalError(null);

    try {
      // 배송 정보 업데이트
      await updateShippingInfo(deliveryInfo);

      // 토스페이먼츠 결제 요청
      await requestPayment({
        orderId: winningProduct.orderNumber,
        orderName: winningProduct.title,
        successUrl: `${window.location.origin}/payment/success?myOrderId=${orderId}&amount=${winningProduct.winningBid}`,
        failUrl: `${window.location.origin}/payment/fail?myOrderId=${orderId}`,
        customerEmail: "customer@example.com",
        customerName: deliveryInfo.name,
        customerMobilePhone: deliveryInfo.phone.replace(/-/g, ""),
      });
    } catch (error) {
      const appError = normalizeError(error);
      console.error("주문 처리 실패:", error);
      setGlobalError(formatUserMessage(appError));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-background min-h-screen py-6 sm:py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {globalError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        )}
        <h1 className="text-foreground mb-8 text-2xl font-bold sm:mb-10 sm:text-3xl md:mb-12 md:text-4xl">
          주문 결제
        </h1>

        {isLoading ? (
          <OrderSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 sm:space-y-8 lg:col-span-2">
              <ShippingForm
                deliveryInfo={deliveryInfo}
                errors={errors}
                isOpen={isOpen}
                onAddressComplete={handleAddressComplete}
                onAddressSearchOpen={() => setIsOpen(true)}
                onAddressSearchClose={() => setIsOpen(false)}
                onChange={handleDeliveryChange}
              />

              <PaymentWidget
                widgetReady={widgetReady}
                isProcessing={isProcessing}
                onPayment={handleCompleteOrder}
              />
            </div>

            {/* Order Summary Sidebar */}
            <PaymentSummary
              winningProduct={winningProduct}
              totalAmount={winningProduct.winningBid}
            />
          </div>
        )}
      </div>
    </main>
  );
}
