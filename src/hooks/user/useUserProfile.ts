import { useState } from "react";
import { apiPut } from "@/lib/api";
import { formatJoinDate } from "@/lib/utils";
import type { MeResponse } from "./useMe";

// --- 타입 정의 ---
export type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
};

const INITIAL_USER: UserProfile = {
  nickname: "익명 사용자",
  joinDate: "가입일 정보 없음",
  rating: 0,
  reviews: 0,
  phoneNumber: "",
};

// --- Custom Hook ---
export function useUserProfile(
  meData: MeResponse | null,
  isMeLoading: boolean,
) {
  const [error, setError] = useState<string | null>(null);

  // meData로부터 user 정보를 파생
  const user: UserProfile =
    !isMeLoading && meData
      ? {
          nickname: meData.nickname ?? INITIAL_USER.nickname,
          joinDate: meData.createdAt
            ? formatJoinDate(meData.createdAt)
            : INITIAL_USER.joinDate,
          rating: meData.rating ?? INITIAL_USER.rating,
          reviews: meData.reviews ?? INITIAL_USER.reviews,
          phoneNumber: meData.phoneNumber
            ? String(meData.phoneNumber).trim()
            : INITIAL_USER.phoneNumber,
        }
      : INITIAL_USER;

  // 프로필 저장
  const handleProfileSave = async (
    nickname: string,
    phoneNumber: string,
  ): Promise<void> => {
    try {
      setError(null);
      await apiPut("/api/users/me", {
        nickname,
        phoneNumber,
      });
      // 저장 성공 후 상위 컴포넌트에서 meData를 다시 fetch해야 합니다
    } catch (e) {
      console.error("Failed to save profile:", e);
      const errorMsg = "프로필 저장에 실패했습니다.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    user,
    isLoading: isMeLoading,
    error,
    handleProfileSave,
  };
}
