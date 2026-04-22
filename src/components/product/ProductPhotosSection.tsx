"use client";

import Image from "next/image";
import { Upload, Star } from "lucide-react";

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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-sm font-semibold md:text-base">
            상품 사진 <span className="text-red-500">*</span>
          </h3>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">
            최대 5장까지 업로드 가능, 대표 사진을 선택해주세요.
          </p>
        </div>
        <span className="text-muted-foreground text-xs md:text-sm">
          {images.length}/5
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {remainingUploads > 0 && (
          <label className="border-border hover:bg-muted/60 flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors">
            <Upload className="text-muted-foreground h-6 w-6 md:h-7 md:w-7" />
            <span className="text-muted-foreground mt-1 text-[11px] md:text-xs">
              업로드
            </span>
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
              className={`group relative aspect-square w-full overflow-hidden rounded-xl border transition-all ${
                isMain
                  ? "border-primary/70 ring-primary ring-offset-background ring-2 ring-offset-2"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <Image
                src={img || "/placeholder.svg"}
                alt={`Upload ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              <div
                className={`absolute top-1.5 left-1.5 ${
                  isMain
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSetMain(idx)}
                  aria-label="대표 이미지 설정"
                  className={`rounded-full p-1.5 shadow ${
                    isMain
                      ? "bg-yellow-400/90 text-yellow-900"
                      : "bg-background/90 text-muted-foreground"
                  }`}
                >
                  <Star size={14} />
                </button>
              </div>
              <div className="absolute top-1.5 right-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="bg-destructive text-primary-foreground rounded px-2 py-1 text-[11px] shadow"
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
