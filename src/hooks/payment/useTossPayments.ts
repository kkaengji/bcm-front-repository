import { useState, useEffect, useRef } from "react";
import { USE_MOCK_API } from "@/lib/constants";

// 토스페이먼츠 SDK 타입 정의
export interface TossPaymentsWidgets {
  setAmount: (amount: { currency: string; value: number }) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string;
  }) => Promise<void>;
  renderPaymentMethods: (options: {
    selector: string;
    variantKey: string;
  }) => Promise<{ destroy?: () => void }>;
  renderAgreement: (options: { selector: string }) => Promise<void>;
}

declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      widgets: (options: {
        customerKey: string;
      }) => Promise<TossPaymentsWidgets>;
    };
  }
}

interface UseTossPaymentsReturn {
  widgetReady: boolean;
  widgetsRef: React.MutableRefObject<TossPaymentsWidgets | null>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string;
  }) => Promise<void>;
  setAmount: (amount: number) => Promise<void>;
}

// 토스페이먼츠 클라이언트 키
const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

/**
 * 토스페이먼츠 결제 위젯을 관리하는 훅
 * - 위젯 초기화 및 렌더링
 * - 결제 요청
 * - 금액 설정
 */
export function useTossPayments(
  orderId: number,
  totalAmount: number,
  isPageReady: boolean = true, // DOM이 준비되었는지 여부
): UseTossPaymentsReturn {
  const [widgetReady, setWidgetReady] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const paymentMethodWidgetRef = useRef<{
    destroy?: () => void;
  } | null>(null);
  const isInitializedRef = useRef(false);

  // Mock 모드: 짧은 딜레이 후 widgetReady=true
  useEffect(() => {
    if (!USE_MOCK_API) return;
    if (!isPageReady || !orderId || !totalAmount) return;
    const timer = setTimeout(() => setWidgetReady(true), 600);
    return () => clearTimeout(timer);
  }, [isPageReady, orderId, totalAmount]);

  // 토스페이먼츠 결제위젯 초기화 (한 번만 실행)
  useEffect(() => {
    if (USE_MOCK_API) return;
    const initializeTossPayments = async () => {
      // 페이지가 준비되지 않았으면 초기화하지 않음
      if (!isPageReady) {
        return;
      }

      // 이미 초기화되었거나 필수 값이 없으면 return
      if (isInitializedRef.current || !orderId || !totalAmount) {
        return;
      }

      if (!window.TossPayments) {
        console.error("토스페이먼츠 SDK가 로드되지 않았습니다.");
        return;
      }

      try {
        const customerKey = `customer_${orderId}_${Date.now()}`;

        // 토스페이먼츠 초기화
        const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);

        // 결제위젯 초기화
        const widgets = await tossPayments.widgets({ customerKey });
        widgetsRef.current = widgets;

        // 결제 금액 설정
        await widgets.setAmount({
          currency: "KRW",
          value: totalAmount,
        });

        // DOM 요소 확인
        const paymentWidgetElement = document.querySelector("#payment-widget");
        const agreementElement = document.querySelector("#agreement");

        if (!paymentWidgetElement || !agreementElement) {
          console.error(
            "결제 관련 DOM 요소를 찾을 수 없습니다. 페이지 렌더링이 완료될 때까지 대기하세요.",
          );
          return;
        }

        // 결제 UI 렌더링
        const paymentMethodWidget = await widgets.renderPaymentMethods({
          selector: "#payment-widget",
          variantKey: "DEFAULT",
        });
        paymentMethodWidgetRef.current = paymentMethodWidget;

        // 약관 UI 렌더링
        await widgets.renderAgreement({
          selector: "#agreement",
        });

        setWidgetReady(true);
        isInitializedRef.current = true; // 초기화 완료 표시
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
        isInitializedRef.current = false; // 실패 시 재시도 가능하도록
      }
    };

    initializeTossPayments();

    // cleanup - 컴포넌트 언마운트 시에만 위젯 제거
    return () => {
      if (paymentMethodWidgetRef.current) {
        paymentMethodWidgetRef.current.destroy?.();
      }
      // DOM 요소 초기화
      const paymentWidget = document.querySelector("#payment-widget");
      const agreement = document.querySelector("#agreement");
      if (paymentWidget) paymentWidget.innerHTML = "";
      if (agreement) agreement.innerHTML = "";

      widgetsRef.current = null;
      paymentMethodWidgetRef.current = null;
      isInitializedRef.current = false;
      setWidgetReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isPageReady]); // totalAmount는 초기화 시에만 사용

  // 결제 금액 변경시 업데이트
  useEffect(() => {
    if (widgetsRef.current && widgetReady && totalAmount) {
      widgetsRef.current.setAmount({
        currency: "KRW",
        value: totalAmount,
      });
    }
  }, [totalAmount, widgetReady]);

  const requestPayment = async (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail: string;
    customerName: string;
    customerMobilePhone: string;
  }) => {
    if (USE_MOCK_API) {
      const mockPaymentKey = `mock_pk_${Date.now()}`;
      const url = new URL(options.successUrl);
      url.searchParams.set("paymentKey", mockPaymentKey);
      url.searchParams.set("orderId", options.orderId);
      url.searchParams.set("amount", String(totalAmount));
      window.location.href = url.toString();
      return;
    }

    if (!widgetsRef.current) {
      throw new Error("결제 위젯이 준비되지 않았습니다.");
    }

    return widgetsRef.current.requestPayment(options);
  };

  const setAmount = async (amount: number) => {
    if (!widgetsRef.current) {
      throw new Error("결제 위젯이 준비되지 않았습니다.");
    }

    return widgetsRef.current.setAmount({
      currency: "KRW",
      value: amount,
    });
  };

  return {
    widgetReady,
    widgetsRef,
    requestPayment,
    setAmount,
  };
}
