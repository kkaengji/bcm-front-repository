/**
 * 상품 상태
 */
export const PRODUCT_STATUS = [
  { label: "미개봉", value: "UNOPENED" },
  { label: "좋음", value: "GOOD" },
  { label: "보통", value: "AVERAGE" },
  { label: "나쁨", value: "BAD" },
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[number]["value"];

/**
 * 주문 상태 (구매 내역)
 */
export const ORDER_STATUS = [
  { label: "결제 대기", value: "PAYMENT_PENDING" },
  { label: "결제 완료", value: "PAID" },
  { label: "기간 만료", value: "EXPIRED" },
  { label: "취소됨", value: "CANCELLED" },
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number]["value"];

/**
 * 경매 상태 (판매 내역)
 */
export const BID_STATUS = [
  { label: "미입찰", value: "NOT_BIDDED" },
  { label: "입찰중", value: "BIDDED" },
  { label: "유찰", value: "NO_BIDDER" },
  { label: "결제대기", value: "PAYMENT_WAITING" },
  { label: "종료", value: "COMPLETED" },
] as const;

export type BidStatus = (typeof BID_STATUS)[number]["value"];

/**
 * 회원가입/인증 정책
 */
export const AUTH_POLICIES = {
  PASSWORD_POLICY: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{10,}$/,
  NICKNAME_POLICY: /^[A-Za-z가-힣]+$/,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 10,
} as const;

/**
 * WebSocket 연결 설정
 */
export const WEBSOCKET_CONFIG = {
  RECONNECT_DELAY: 5000, // 5초 - 재연결 대기 시간 (밀리초)
  HEARTBEAT_INCOMING: 4000, // 4초 - 수신 하트비트 간격 (밀리초)
  HEARTBEAT_OUTGOING: 4000, // 4초 - 송신 하트비트 간격 (밀리초)
} as const;

/**
 * 입찰 금액 제한
 */
export const BID_AMOUNT_LIMITS = {
  MAX_DIGITS: 16, // 최대 자릿수
  MAX_AMOUNT: 10000000000000000, // 1경 (10,000,000,000,000,000)
} as const;

/**
 * 시간 변환 상수 (밀리초)
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
} as const;

/**
 * API 기본 URL
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * 서버에서 빈 결과를 반환할 때 목데이터를 사용할지 여부
 * - 기본값: 개발 환경에서는 사용(true), 프로덕션에서는 사용 안 함(false)
 * - 환경변수로 강제 설정 가능: NEXT_PUBLIC_USE_MOCK_WHEN_EMPTY
 */
export const USE_MOCK_WHEN_EMPTY = (() => {
  const envValue = process.env.NEXT_PUBLIC_USE_MOCK_WHEN_EMPTY ?? "";

  // 명시적으로 설정된 경우
  if (envValue === "true") return true;
  if (envValue === "false") return false;

  // 기본값: 프로덕션이 아닐 때만 사용
  return process.env.NODE_ENV !== "production";
})();

/**
 * 결제 관련 설정
 */
export const PAYMENT_CONFIG = {
  SHIPPING_FEE: 3000, // 배송료 (원)
  TAX_RATE: 0.1, // 세금률 (10%)
  ESTIMATED_DELIVERY: "3-5 영업일", // 예상 배송 기간
} as const;
