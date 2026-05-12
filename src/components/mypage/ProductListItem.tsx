"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS } from "@/lib/constants";
import { formatCurrency, getProductStatusLabel } from "@/lib/utils";

interface ProductListItemProps {
  id: number | string;
  name: string;
  price: number;
  status?: string;
  subText?: string;
  badgeText?: string;
  image?: string;
  linkPrefix?: string;
  actionNode?: React.ReactNode;
}

export function ProductListItem({
  id,
  name,
  price,
  status,
  subText,
  badgeText,
  image,
  linkPrefix = "/products",
  actionNode,
}: ProductListItemProps) {
  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-card/50 p-3 transition-colors hover:bg-card sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`${linkPrefix}/${id}`}
        className="flex min-w-0 flex-1 items-center gap-3 sm:pr-3"
      >
        {/* 상품 이미지 */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* 상품 정보 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-foreground truncate font-semibold text-sm">{name}</p>
            {badgeText && (
              <Badge variant="secondary" className="h-5 shrink-0 px-1.5 py-0 text-[10px]">
                {badgeText}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            {status && (
              <span>
                {getProductStatusLabel(status.toUpperCase(), PRODUCT_STATUS)}
              </span>
            )}
            {status && subText && <span>·</span>}
            {subText && <span>{subText}</span>}
          </div>
          <p className="font-price text-foreground mt-1 font-bold text-sm">
            {formatCurrency(price)}
          </p>
        </div>
      </Link>

      {actionNode && (
        <div className="mt-3 w-full border-t border-white/8 pt-3 [&>button]:w-full sm:mt-0 sm:w-auto sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0 sm:[&>button]:w-auto">
          {actionNode}
        </div>
      )}
    </div>
  );
}
