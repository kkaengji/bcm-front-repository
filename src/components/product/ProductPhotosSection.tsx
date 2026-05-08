"use client";

import Image from "next/image";
import { Upload, Star, X, ImagePlus } from "lucide-react";

type Props = {
  images: string[];
  files: File[];
  mainIndex: number;
  remainingUploads: number;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
};

export default function ProductPhotosSection({
  images,
  files,
  mainIndex,
  remainingUploads,
  onUpload,
  onRemove,
  onSetMain,
}: Props) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-sm font-semibold md:text-base">
            상품 사진 <span className="text-destructive">*</span>
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            대표 사진을 별표로 지정해주세요
          </p>
        </div>
        <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums">
          {images.length} / 5
        </span>
      </div>

      {images.length === 0 ? (
        <label className="border-border hover:border-primary/50 hover:bg-accent/40 flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-12 transition-colors">
          <div className="bg-muted rounded-full p-4">
            <ImagePlus className="text-muted-foreground h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-medium">
              사진을 업로드해주세요
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              PNG, JPG, WEBP · 최대 5장
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {remainingUploads > 0 && (
            <label className="border-border hover:border-primary/50 hover:bg-accent/30 flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors">
              <Upload className="text-muted-foreground h-5 w-5" />
              <span className="text-muted-foreground text-[11px]">추가</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                onChange={onUpload}
                className="hidden"
                disabled={images.length >= 5}
              />
            </label>
          )}

          {images.map((img, idx) => {
            const isMain = mainIndex === idx;
            return (
              <div
                key={files[idx]?.name || `${img}-${idx}`}
                className={`group relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all ${
                  isMain
                    ? "border-primary ring-primary/20 ring-4"
                    : "border-transparent hover:border-border"
                }`}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Upload ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />

                {isMain && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent py-1.5 text-center">
                    <span className="text-[10px] font-semibold text-white">
                      대표
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 flex items-start justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onSetMain(idx)}
                    aria-label="대표 이미지 설정"
                    className={`rounded-full p-1 shadow-md transition-colors ${
                      isMain
                        ? "bg-yellow-400 text-yellow-900"
                        : "bg-black/50 text-white hover:bg-yellow-400 hover:text-yellow-900"
                    }`}
                  >
                    <Star size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="rounded-full bg-black/50 p-1 text-white shadow-md transition-colors hover:bg-destructive"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
