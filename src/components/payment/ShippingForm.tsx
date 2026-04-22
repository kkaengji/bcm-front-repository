"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import AddressSearch from "@/components/payment/AddressSearch";
import type { DeliveryInfo } from "@/hooks/payment/usePaymentOrder";

interface ShippingFormProps {
  deliveryInfo: DeliveryInfo;
  errors: Record<string, string>;
  isOpen: boolean;
  onAddressComplete: (data: { zonecode: string; address: string }) => void;
  onAddressSearchOpen: () => void;
  onAddressSearchClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ShippingForm({
  deliveryInfo,
  errors,
  isOpen,
  onAddressComplete,
  onAddressSearchOpen,
  onAddressSearchClose,
  onChange,
}: ShippingFormProps) {
  return (
    <>
      {isOpen && (
        <AddressSearch
          onComplete={onAddressComplete}
          onClose={onAddressSearchClose}
        />
      )}
      <div className="bg-card border-border space-y-4 rounded-lg border p-4 sm:space-y-6 sm:p-6">
        <h2 className="text-foreground text-xl font-bold sm:text-2xl">
          배송 정보
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="text-foreground mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
              이름 *
            </label>
            <input
              type="text"
              name="name"
              value={deliveryInfo.name}
              onChange={onChange}
              placeholder="성함을 입력하세요"
              className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:px-4 ${
                errors.name ? "border-red-500" : "border-border"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="text-foreground mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
              전화번호 *
            </label>
            <input
              type="tel"
              name="phone"
              value={deliveryInfo.phone}
              onChange={onChange}
              placeholder="010-0000-0000"
              className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:px-4 ${
                errors.phone ? "border-red-500" : "border-border"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-foreground mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
            우편번호 *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="12345"
              name="postalCode"
              value={deliveryInfo.postalCode}
              onChange={onChange}
              className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:px-4 ${
                errors.postalCode ? "border-red-500" : "border-border"
              }`}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg bg-transparent px-3 text-xs sm:px-4 sm:text-sm"
              onClick={onAddressSearchOpen}
            >
              찾기
            </Button>
          </div>
          {errors.postalCode && (
            <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label className="text-foreground mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
            도로명 주소 *
          </label>
          <input
            type="text"
            name="address"
            value={deliveryInfo.address}
            onChange={onChange}
            placeholder="도로명 주소"
            className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground mb-2 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:px-4 ${
              errors.address ? "border-red-500" : "border-border"
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
          )}
          <input
            type="text"
            name="detailAddress"
            value={deliveryInfo.detailAddress}
            onChange={onChange}
            placeholder="상세 주소 (아파트, 동/호 등)"
            className={`bg-background text-foreground focus:ring-primary placeholder:text-muted-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none sm:px-4 ${
              errors.detailAddress ? "border-red-500" : "border-border"
            }`}
          />
          {errors.detailAddress && (
            <p className="mt-1 text-xs text-red-500">{errors.detailAddress}</p>
          )}
        </div>
      </div>
    </>
  );
}
