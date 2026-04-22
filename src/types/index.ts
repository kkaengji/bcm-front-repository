/**
 * 타입 중앙 export
 * 모든 도메인 타입을 한 곳에서 import 가능하도록 re-export합니다.
 */

// 공통 타입
export type { Sort, Pageable, Category, CategoryListResponse } from "./common";

// 인증 타입
export type {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  JWTPayload,
  ReissueResponse,
  User,
  AuthContextType,
} from "./auth";

// 상품 타입
export type {
  ProductImage,
  Product,
  WinnerDetails,
  MypageProductBid,
  ProductBid,
  CreateProductRequest,
  ProductListResponse,
  ProductFormData,
  Bid,
} from "./product";

// 주문 타입
export type {
  ShippingInfo,
  UpdateShippingInfoRequest,
  Order,
  OrderDetail,
} from "./order";

// 결제 타입
export type {
  TossPaymentsWidgets,
  PaymentRequestOptions,
  PaymentResponse,
} from "./payment";

// 에러 타입
export type { AppError, ErrorCategory } from "./error";
