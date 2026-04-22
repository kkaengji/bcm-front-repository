"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { Category, CategoryListResponse } from "@/types";

export type CategoryOption = { id: number; label: string; value: string };

type CategoryApiItem = Category & { label?: string; value?: string };
type CategoryApiResponse = CategoryListResponse;

export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "50",
        sort: "name,asc",
      });

      const response = await apiGet<CategoryApiResponse | CategoryApiItem[]>(
        `/api/products/categories?${params.toString()}`,
      );

      const list: CategoryApiItem[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      const mapped = list
        .map((item) => {
          const label = item.label || item.name || item.value;
          const value = item.value || item.code || item.name || item.label;
          const id = item.id;
          if (!label || !value || id === undefined) return null;
          return { id, label, value } satisfies CategoryOption;
        })
        .filter((v): v is CategoryOption => Boolean(v));

      const nextCategories = mapped.length ? mapped : [];

      setCategories(nextCategories);
    } catch (err) {
      console.error("카테고리 불러오기 실패:", err);
      setError("카테고리를 불러오는데 실패했습니다.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
