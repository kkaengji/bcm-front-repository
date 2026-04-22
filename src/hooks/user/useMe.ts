import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MypageProductBid, Order, Product, WinnerDetails } from "@/types";

export type MeResponse = {
  nickname?: string;
  createdAt?: string;
  rating?: number;
  reviews?: number;
  phoneNumber?: string;
  products?: Product[];
  productBids?: MypageProductBid[];
  orders?: Order[];
  winners?: WinnerDetails[];
};

export function useMe() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  const fetchMe = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setData(null);
        setIsLoading(false);
        return;
      }

      const me = await apiGet<MeResponse>("/api/users/me");
      setData(me ?? null);
    } catch (e) {
      console.error("Failed to fetch /api/users/me:", e);
      setError("사용자 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchMe();
  }, [fetchMe]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMe,
  };
}
