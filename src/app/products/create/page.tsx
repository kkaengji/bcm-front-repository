"use client";

import { Button } from "@/components/ui/button";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Package,
  Tag,
  Timer,
} from "lucide-react";
import { useCreateProductForm } from "@/hooks/useCreateProductForm";
import { PRODUCT_STATUS } from "@/lib/constants";
import ProductPhotosSection from "@/components/product/ProductPhotosSection";
import { useRouter } from "next/navigation";

const SECTION_ICON_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary";

export default function CreateProductPage() {
  const router = useRouter();
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

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      {/* Sticky header */}
      <div className="border-border/60 bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground -ml-1 rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-foreground text-base font-semibold">상품 등록</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-32">
        <div className="space-y-6">
          {/* Section 1: Photos */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className={SECTION_ICON_CLASS}>
                <Camera size={16} />
              </div>
              <span className="text-foreground text-sm font-semibold">사진</span>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <ProductPhotosSection
                images={uploadedImages}
                files={imageFiles}
                mainIndex={mainImageIndex}
                remainingUploads={remainingUploads}
                onUpload={handleImageUpload}
                onRemove={removeImage}
                onSetMain={setMainImageIndex}
              />
            </div>
          </section>

          {/* Section 2: Product Details */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className={SECTION_ICON_CLASS}>
                <Package size={16} />
              </div>
              <span className="text-foreground text-sm font-semibold">상품 정보</span>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  상품명 <span className="text-destructive">*</span>
                </label>
                <input
                  name="name"
                  placeholder="어떤 상품인가요?"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-4 text-sm transition-all focus:outline-none focus:ring-2"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">
                    카테고리 <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full appearance-none rounded-xl border px-4 pr-9 text-sm transition-all focus:outline-none focus:ring-2"
                    >
                      {isCategoriesLoading && (
                        <option value="" disabled>
                          불러오는 중...
                        </option>
                      )}
                      {!isCategoriesLoading && categories.length === 0 && (
                        <option value="" disabled>
                          카테고리 없음
                        </option>
                      )}
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-medium">
                    상품 상태 <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="productStatus"
                      value={formData.productStatus}
                      onChange={handleInputChange}
                      className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full appearance-none rounded-xl border px-4 pr-9 text-sm transition-all focus:outline-none focus:ring-2"
                    >
                      {PRODUCT_STATUS.map((cond) => (
                        <option key={cond.value} value={cond.value}>
                          {cond.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  상품 설명
                </label>
                <textarea
                  name="description"
                  placeholder="상품 상태, 구매 시기, 사용감 등을 자세히 적어주세요"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Pricing & Duration */}
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className={SECTION_ICON_CLASS}>
                <Tag size={16} />
              </div>
              <span className="text-foreground text-sm font-semibold">가격 및 기간</span>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
              {/* Starting Price */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  시작 가격 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium select-none">
                    ₩
                  </span>
                  <input
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-4 pl-8 text-sm transition-all focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    step="1"
                    min="0"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-medium">
                  경매 종료 날짜 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Timer
                    size={15}
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
                  />
                  <input
                    type="date"
                    name="bidEndDate"
                    value={formData.bidEndDate || ""}
                    onChange={(e) => handleBidEndDateChange(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 h-11 w-full rounded-xl border px-4 pl-10 text-sm transition-all focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Fixed bottom submit bar */}
      <div className="border-border/60 bg-background/90 fixed right-0 bottom-0 left-0 border-t backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            size="lg"
            className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-px hover:shadow-primary/30 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "등록하기"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
