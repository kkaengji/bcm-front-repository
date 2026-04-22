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
    <div className="hover:bg-muted/50 border-border flex items-center justify-between border-b p-4 transition-colors last:border-b-0">
      <Link
        href={`${linkPrefix}/${id}`}
        className="flex flex-1 items-center gap-4 pr-4"
      >
        {/* 상품 이미지 */}
        {image && (
          <img
            src={image}
            alt={name}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        )}
        {/* 상품 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-foreground font-medium">{name}</p>
            {badgeText && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 py-0 text-[10px]"
              >
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
            {status && subText && <span>•</span>}
            {subText && <span>{subText}</span>}
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="shrink-0 text-right">
          <p className="text-foreground font-bold">{formatCurrency(price)}</p>
        </div>
      </Link>

      {/* 액션 버튼이 있을 경우 렌더링 */}
      {actionNode && (
        <div className="border-border ml-4 border-l pl-4">{actionNode}</div>
      )}
    </div>
  );
}
