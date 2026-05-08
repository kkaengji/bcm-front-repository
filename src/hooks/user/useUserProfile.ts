import { useState } from "react";
import { apiPost, apiPut } from "@/lib/api";
import { formatJoinDate, calcTemperature } from "@/lib/utils";
import { USE_MOCK_API } from "@/lib/constants";
import type { MeResponse } from "./useMe";

// --- 타입 정의 ---
export type UserProfile = {
  nickname: string;
  joinDate: string;
  rating: number;
  reviews: number;
  phoneNumber: string;
  profileImageUrl?: string;
  address?: string;
  detailAddress?: string;
  zipCode?: string;
  temperature: number;
};

const INITIAL_USER: UserProfile = {
  nickname: "익명 사용자",
  joinDate: "가입일 정보 없음",
  rating: 0,
  reviews: 0,
  phoneNumber: "",
  profileImageUrl: undefined,
  address: undefined,
  detailAddress: undefined,
  zipCode: undefined,
  temperature: 36.5,
};

const toDataUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

// --- Custom Hook ---
export function useUserProfile(
  meData: MeResponse | null,
  isMeLoading: boolean,
) {
  const [error, setError] = useState<string | null>(null);

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
          profileImageUrl: meData.profileImageUrl,
          address: meData.address,
          detailAddress: meData.detailAddress,
          zipCode: meData.zipCode,
          temperature: calcTemperature(
            meData.rating ?? 0,
            meData.reviews ?? 0,
          ),
        }
      : INITIAL_USER;

  const handleProfileSave = async (
    nickname: string,
    phoneNumber: string,
    profileImageFile?: File | null,
    address?: string,
    detailAddress?: string,
    zipCode?: string,
  ): Promise<void> => {
    try {
      setError(null);

      let profileImageUrl: string | undefined;

      if (profileImageFile) {
        if (USE_MOCK_API) {
          profileImageUrl = await toDataUrl(profileImageFile);
        } else {
          const uploadedUrls = await apiPost<string[]>("/api/s3/upload-url", {
            uploadUrls: [profileImageFile.name],
          });
          await fetch(uploadedUrls[0], {
            method: "PUT",
            headers: { "Content-Type": profileImageFile.type },
            body: profileImageFile,
          });
          profileImageUrl = uploadedUrls[0].split("?")[0];
        }
      }

      await apiPut("/api/users/me", {
        nickname,
        phoneNumber,
        ...(profileImageUrl !== undefined && { profileImageUrl }),
        ...(address !== undefined && { address }),
        ...(detailAddress !== undefined && { detailAddress }),
        ...(zipCode !== undefined && { zipCode }),
      });
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
