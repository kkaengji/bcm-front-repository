import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { ProductQuestion } from "@/types";

export function useProductQA(productId: number) {
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const data = await apiGet<ProductQuestion[]>(`/api/products/${productId}/questions`);
      setQuestions(data);
    } catch {
      // Q&A 로드 실패 시 빈 상태 유지
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const submitQuestion = useCallback(
    async (content: string): Promise<void> => {
      setIsSubmitting(true);
      try {
        await apiPost(`/api/products/${productId}/questions`, { content });
        await fetchQuestions();
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId, fetchQuestions],
  );

  const submitAnswer = useCallback(
    async (questionId: number, content: string): Promise<void> => {
      setIsSubmitting(true);
      try {
        await apiPost(`/api/products/${productId}/questions/${questionId}/answers`, { content });
        await fetchQuestions();
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId, fetchQuestions],
  );

  return { questions, isLoading, isSubmitting, submitQuestion, submitAnswer };
}
