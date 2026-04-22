"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

import { useAuth } from "@/hooks/user/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { ProductFormData } from "@/types";

const MAX_IMAGES = 5;

// 파일명/확장자 분리
const getFileNameAndExt = (fileName: string) => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) {
    return { name: fileName, ext: "" };
  }
  const name = fileName.slice(0, lastDot);
  const ext = fileName.slice(lastDot + 1);
  return { name, ext };
};

export function useCreateProductForm() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const allowedFormats = useMemo(
    () => ["image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"],
    [],
  );
  const allowedExtensions = useMemo(
    () => ["png", "jpg", "jpeg", "gif", "webp"],
    [],
  );

  const [step, setStep] = useState(1);
  const defaultBidEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    startPrice: "0",
    bidEndDate: defaultBidEndDate,
    productStatus: "UNOPENED",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 로직 분리
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  useEffect(() => {
    if (!isAuthLoading && user === null) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  const initializeFormCategory = useCallback(() => {
    // 카테고리가 로드되면 폼 데이터 초기화
    setFormData((prev) => {
      const hasCategory =
        prev.category && categories.some((c) => c.value === prev.category);
      const fallback = categories[0]?.value || "";
      return {
        ...prev,
        category: hasCategory ? prev.category : fallback,
      };
    });
  }, [categories]);

  useEffect(() => {
    initializeFormCategory();
  }, [initializeFormCategory]);

  useEffect(() => {
    return () => {
      uploadedImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedImages]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartPriceChange = useCallback((value: string) => {
    if (value === "" || value.length <= 12) {
      setFormData((prev) => ({ ...prev, startPrice: value }));
    }
  }, []);

  const handleBidEndDateChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, bidEndDate: value }));
  }, []);

  const handleNextStep = () => step < 4 && setStep(step + 1);
  const handlePrevStep = () => step > 1 && setStep(step - 1);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const available = MAX_IMAGES - imageFiles.length;
      if (available <= 0) {
        alert(`사진은 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
        e.target.value = "";
        return;
      }

      const filesToAdd = files.slice(0, available);
      const newFiles: File[] = [];
      const newUrls: string[] = [];

      filesToAdd.forEach((file, index) => {
        const { ext, name: originalName } = getFileNameAndExt(file.name);
        const isValidType = allowedFormats.includes(file.type.toLowerCase());
        const isValidExt = allowedExtensions.includes(ext.toLowerCase());

        if (!isValidType && !isValidExt) {
          alert(
            "PNG, JPG, JPEG, GIF, WEBP 형식의 이미지만 업로드할 수 있습니다.",
          );
          return;
        }

        const timestamp = Date.now();
        const safeExt = ext || file.type.split("/")[1] || "img";
        const newFileName = `${originalName}_${timestamp}_${index}.${safeExt}`;

        const renamedFile = new File([file], newFileName, { type: file.type });
        const newUrl = URL.createObjectURL(renamedFile);

        newFiles.push(renamedFile);
        newUrls.push(newUrl);
      });

      if (newFiles.length) {
        setImageFiles((prev) => [...prev, ...newFiles]);
        setUploadedImages((prev) => [...prev, ...newUrls]);
        setMainImageIndex((prev) =>
          imageFiles.length === 0 && prev === 0 ? 0 : prev,
        );
      }

      e.target.value = "";
    },
    [allowedExtensions, allowedFormats, imageFiles.length],
  );

  const removeImage = useCallback((indexToRemove: number) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      // 대상 URL은 제거 후 안전하게 revoke
      const targetUrl = prev[indexToRemove];
      if (targetUrl) URL.revokeObjectURL(targetUrl);
      return next;
    });
    setImageFiles((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      setMainImageIndex((prevMain) => {
        if (next.length === 0) return 0;
        if (prevMain === indexToRemove) return 0;
        if (prevMain > indexToRemove) return prevMain - 1;
        return prevMain;
      });
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      alert("이미지를 1개 이상 등록해야 합니다.");
      setStep(1);
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      alert("상품명을 입력해주세요.");
      setStep(2);
      return;
    }

    if (!formData.bidEndDate || formData.bidEndDate.trim() === "") {
      alert("경매 종료 날짜를 입력해주세요.");
      setStep(3);
      return;
    }

    const endDate = new Date(formData.bidEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      alert("경매 종료 날짜는 오늘 이후여야 합니다.");
      setStep(4);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // S3에 이미지 업로드 - 모든 파일 이름을 배열로 요청
      const fileNames = imageFiles.map((file) => file.name);
      const uploadUrls = await apiPost<string[]>("/api/s3/upload-url", {
        uploadUrls: fileNames,
      });

      // 각 파일을 presigned URL로 업로드
      for (let i = 0; i < imageFiles.length; i++) {
        await fetch(uploadUrls[i], {
          method: "PUT",
          headers: {
            "Content-Type": imageFiles[i].type,
          },
          body: imageFiles[i],
        });
      }

      // 종료 날짜를 현재 시간 이후의 랜덤한 시간으로 설정
      let bidEndDateString = null;
      if (formData.bidEndDate) {
        const selectedDate = new Date(formData.bidEndDate);
        const now = new Date();

        // 선택한 날짜가 오늘이면 현재 시간 이후로, 미래 날짜면 00:00:00 ~ 23:59:59 사이로 설정
        let minTime, maxTime;
        if (selectedDate.toDateString() === now.toDateString()) {
          // 오늘이면 현재 시간 이후부터 23:59:59까지
          minTime =
            now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
          maxTime = 86399; // 23:59:59
        } else {
          // 미래 날짜면 00:00:00 ~ 23:59:59
          minTime = 0;
          maxTime = 86399;
        }

        const randomSeconds =
          Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        const hours = Math.floor(randomSeconds / 3600)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((randomSeconds % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (randomSeconds % 60).toString().padStart(2, "0");

        bidEndDateString = `${formData.bidEndDate}T${hours}:${minutes}:${seconds}`;
      }

      // 메인 이미지를 첫 번째로, 나머지 이미지들을 배열로 구성
      const mainImage = imageFiles[mainImageIndex];
      const otherImages = imageFiles.filter((_, idx) => idx !== mainImageIndex);
      const imageUrls = [mainImage, ...otherImages].map((file) => file.name);
      const thumbnail = mainImage.name;

      const productData = {
        name: formData.name,
        description: formData.description || "",
        categoryId:
          categories.find((c) => c.value === formData.category)?.id || 1,
        price: formData.startPrice ? parseInt(formData.startPrice, 10) : 0,
        bidEndDate: bidEndDateString,
        productStatus: formData.productStatus,
        thumbnail,
        imageUrls,
      };

      const result = await apiPost<{ id: number }>(
        "/api/products",
        productData,
      );

      alert("상품이 성공적으로 등록됐습니다.");
      router.push(`/products/${result.id}`);
    } catch (err) {
      console.error("상품 등록 실패:", err);
      alert("상품 등록에 실패했습니다. 다시 시도해주세요.");
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isPageLoading = isAuthLoading || (!isAuthLoading && user === null);
  const remainingUploads = useMemo(
    () => MAX_IMAGES - imageFiles.length,
    [imageFiles.length],
  );
  const isFormValid = useMemo(
    () => formData.name && formData.startPrice && imageFiles.length > 0,
    [formData.name, formData.startPrice, imageFiles.length],
  );

  return {
    step,
    formData,
    categories,
    mainImageIndex,
    uploadedImages,
    imageFiles,
    isLoading,
    error,
    isPageLoading,
    isCategoriesLoading,
    remainingUploads,
    isFormValid,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleInputChange,
    handleStartPriceChange,
    handleBidEndDateChange,
    handleImageUpload,
    removeImage,
    setMainImageIndex,
    user,
  };
}
