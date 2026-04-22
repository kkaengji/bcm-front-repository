"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageUrl {
  imageUrl: string;
}

interface ProductImageGalleryProps {
  images: ImageUrl[];
  productName: string;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
}

export function ProductImageGallery({
  images,
  productName,
  currentIndex,
  onPrevious,
  onNext,
  onSelectIndex,
}: ProductImageGalleryProps) {
  return (
    <div className="bg-muted border-border relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border shadow-sm">
      <Image
        src={images[currentIndex]?.imageUrl || "/placeholder.svg"}
        alt={productName}
        width={600}
        height={600}
        quality={75}
        className="h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            aria-label="이전 이미지"
            onClick={onPrevious}
            className="focus:ring-primary absolute top-1/2 left-3 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/70 p-2 text-black shadow-md backdrop-blur-sm transition hover:bg-white focus:ring-2 focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="다음 이미지"
            onClick={onNext}
            className="focus:ring-primary absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-white/70 p-2 text-black shadow-md backdrop-blur-sm transition hover:bg-white focus:ring-2 focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`이미지 ${i + 1}`}
                onClick={() => onSelectIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  currentIndex === i
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
