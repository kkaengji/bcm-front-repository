/**
 * 결제 관련 타입
 */

// 토스페이먼츠 SDK 타입
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

// 결제 요청 옵션
export interface PaymentRequestOptions {
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string;
}

// 결제 응답
export interface PaymentResponse {
  paymentKey: string;
  orderId: string;
  amount: number;
  status:
    | "READY"
    | "IN_PROGRESS"
    | "WAITING_FOR_DEPOSIT"
    | "COMPLETED"
    | "CANCELLED"
    | "PARTIAL_CANCELLED"
    | "ABORTED"
    | "EXPIRED";
}
