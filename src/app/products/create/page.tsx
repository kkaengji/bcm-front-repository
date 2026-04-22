"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useCreateProductForm } from "@/hooks/useCreateProductForm";
import { PRODUCT_STATUS } from "@/lib/constants";
import ProductPhotosSection from "@/components/product/ProductPhotosSection";

export default function CreateProductPage() {
  const {
    formData,
    categories,
    mainImageIndex,
    uploadedImages,
    imageFiles,
    isLoading,
    isPageLoading,
    isCategoriesLoading,
    remainingUploads,
    isFormValid,
    handleSubmit,
    handleInputChange,
    handleStartPriceChange,
    handleBidEndDateChange,
    handleImageUpload,
    removeImage,
    setMainImageIndex,
  } = useCreateProductForm();

  // useAuth가 로딩 중이거나, user가 없어 리디렉션 될 때
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // user가 존재할 때만 페이지 렌더링
  return (
    <main className="bg-background min-h-screen py-4 md:py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-foreground text-xl font-bold md:text-2xl">
            상품 등록
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-3 md:space-y-4">
          {/* Section 1: Photos */}
          <Card className="border-border bg-card border p-3 md:p-4">
            <ProductPhotosSection
              images={uploadedImages}
              files={imageFiles}
              mainIndex={mainImageIndex}
              remainingUploads={remainingUploads}
              onUpload={handleImageUpload}
              onRemove={removeImage}
              onSetMain={setMainImageIndex}
            />
          </Card>

          {/* Section 2: Product Details */}
          <Card className="border-border bg-card border p-3 md:p-4">
            <h3 className="text-foreground mb-2 text-sm font-semibold md:text-base">
              상품 정보
            </h3>

            <div className="space-y-2.5 md:space-y-3">
              {/* Title */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                  상품명 <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  placeholder="상품명 입력"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-9 w-full text-sm md:text-base"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div>
                  <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="border-border bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-sm focus:ring-2 focus:outline-none md:text-base"
                  >
                    {isCategoriesLoading && (
                      <option value="" disabled>
                        카테고리 불러오는 중...
                      </option>
                    )}
                    {!isCategoriesLoading && categories.length === 0 && (
                      <option value="" disabled>
                        카테고리가 없습니다
                      </option>
                    )}
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                    상품 상태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productStatus"
                    value={formData.productStatus}
                    onChange={handleInputChange}
                    className="border-border bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-sm focus:ring-2 focus:outline-none md:text-base"
                  >
                    {PRODUCT_STATUS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                  상품 설명
                </label>
                <textarea
                  name="description"
                  placeholder="상품 상태 및 특징을 입력해주세요"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-2 py-2 text-sm focus:ring-2 focus:outline-none md:text-base"
                />
              </div>
            </div>
          </Card>

          {/* Section 3: Pricing & Duration */}
          <Card className="border-border bg-card border p-3 md:p-4">
            <h3 className="text-foreground mb-2 text-sm font-semibold md:text-base">
              가격 및 경매 기간
            </h3>

            <div className="space-y-2.5 md:space-y-3">
              {/* Starting Price */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                  시작 가격 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-sm font-semibold md:text-base">
                    ₩
                  </span>
                  <Input
                    type="number"
                    name="startPrice"
                    placeholder="0"
                    value={formData.startPrice}
                    onChange={(e) => handleStartPriceChange(e.target.value)}
                    onFocus={() => handleStartPriceChange("")}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        handleStartPriceChange("0");
                      }
                    }}
                    className="h-9 flex-1 text-sm md:text-base"
                    step="1"
                    min="0"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-foreground mb-1 block text-xs font-medium md:text-sm">
                  경매 종료 날짜 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="bidEndDate"
                  value={formData.bidEndDate || ""}
                  onChange={(e) => handleBidEndDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="h-9 w-full text-sm md:text-base"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="h-10 w-full text-sm md:text-base"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "상품 등록하기"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
