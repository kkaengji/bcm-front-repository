"use client";

import { useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface ReviewPayload {
  productId: number;
  rating: number;
  comment: string;
  reviewType: "BUYER_TO_SELLER" | "SELLER_TO_BUYER";
}

export function useReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = useCallback(async (payload: ReviewPayload): Promise<void> => {
    setIsSubmitting(true);
    try {
      await apiPost("/api/reviews", payload);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const isReviewed = useCallback(
    async (productId: number, reviewType: "BUYER_TO_SELLER" | "SELLER_TO_BUYER"): Promise<boolean> => {
      try {
        const res = await apiGet<{ reviewed: boolean }>(
          `/api/reviews/check/${productId}?type=${reviewType}`,
        );
        return res?.reviewed ?? false;
      } catch {
        return false;
      }
    },
    [],
  );

  return { submitReview, isSubmitting, isReviewed };
}
