/**
 * 에러 처리 유틸리티
 */

import type { AppError, ErrorCategory } from "@/types";

function detectCategory(message: string): ErrorCategory {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("network") ||
    normalized.includes("failed to fetch")
  ) {
    return "network";
  }
  if (normalized.includes("401") || normalized.includes("unauthorized")) {
    return "auth";
  }
  if (normalized.includes("403") || normalized.includes("forbidden")) {
    return "forbidden";
  }
  if (normalized.includes("404") || normalized.includes("not found")) {
    return "not-found";
  }
  if (normalized.includes("validation") || normalized.includes("invalid")) {
    return "validation";
  }
  if (normalized.includes("payment") || normalized.includes("tosspayments")) {
    return "payment";
  }
  return "unknown";
}

export function normalizeError(error: unknown): AppError {
  if (error && typeof error === "object") {
    if ("category" in error && "message" in error) {
      return error as AppError;
    }
    if (error instanceof Error) {
      const category = detectCategory(error.message || "");
      return {
        category,
        message: error.message || "알 수 없는 오류가 발생했습니다.",
        detail: error.stack,
        retryable: category === "network",
      };
    }
  }

  return {
    category: "unknown",
    message: "알 수 없는 오류가 발생했습니다.",
    detail: typeof error === "string" ? error : undefined,
    retryable: false,
  };
}

export function formatUserMessage(error: AppError): string {
  const base = {
    auth: "로그인이 필요합니다. 다시 로그인해 주세요.",
    forbidden: "이 작업에 대한 권한이 없습니다.",
    "not-found": "요청하신 정보를 찾을 수 없습니다.",
    validation: "입력값을 다시 확인해 주세요.",
    network: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    payment: "결제 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    unknown: "알 수 없는 오류가 발생했습니다.",
  } as const;

  return error.message || base[error.category] || base.unknown;
}
