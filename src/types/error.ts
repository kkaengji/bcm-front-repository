/**
 * 공통 에러 타입 정의
 */

export type ErrorCategory =
  | "auth"
  | "forbidden"
  | "not-found"
  | "validation"
  | "network"
  | "payment"
  | "unknown";

export interface AppError {
  category: ErrorCategory;
  message: string;
  detail?: string;
  status?: number;
  code?: string;
  retryable?: boolean;
}
