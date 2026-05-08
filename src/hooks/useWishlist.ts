"use client";

import { useState } from "react";
import type { BidStatus } from "@/lib/constants";

const WISHLIST_KEY = "bcm_wishlist";

export type WishlistItem = {
  id: number;
  name: string;
  thumbnail: string;
  bidPrice: number;
  bidEndDate: string;
  bidStatus: BidStatus;
};

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggle = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      const next = exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item];
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch {
        // localStorage 용량 초과 등 무시
      }
      return next;
    });
  };

  const isWishlisted = (id: number) => items.some((i) => i.id === id);

  return { items, toggle, isWishlisted, count: items.length };
}
