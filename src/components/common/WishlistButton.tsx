"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist, type WishlistItem } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  product: WishlistItem;
  size?: "sm" | "md";
  className?: string;
}

export default function WishlistButton({
  product,
  size = "md",
  className,
}: WishlistButtonProps) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={cn(
        "rounded-full backdrop-blur-sm transition-all duration-200 active:scale-90",
        size === "sm" ? "p-1.5" : "p-2",
        wishlisted
          ? "bg-primary/20 text-primary"
          : "bg-black/30 text-white hover:bg-black/50",
        className,
      )}
      title={wishlisted ? "찜 해제" : "찜하기"}
      aria-label={wishlisted ? "찜 해제" : "찜하기"}
    >
      <Heart
        className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"}
        fill={wishlisted ? "currentColor" : "none"}
      />
    </button>
  );
}
