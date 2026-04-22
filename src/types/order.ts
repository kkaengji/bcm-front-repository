/**
 * 주문 관련 타입
 */

import type { OrderStatus } from "@/lib/constants";
import type { ProductImage } from "./product";

export interface ShippingInfo {
  name: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
}

export interface UpdateShippingInfoRequest {
  name: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
}

export type Order = {
  orderId: number;
  productName: string;
  bidPrice: number;
  orderStatus: OrderStatus;
  thumbnail?: string;
  imageUrls?: ProductImage[];
  product?: {
    id: number;
    name: string;
    thumbnail?: string;
    imageUrls?: ProductImage[];
  };
};

export interface OrderDetail {
  orderId: number;
  orderNumber: string;
  productName: string;
  bidPrice: number;
  orderStatus: OrderStatus;
  shippingInfo: ShippingInfo | null;
  product: {
    id: number;
    name: string;
    imageUrls: ProductImage[];
    user: {
      nickname: string;
    };
  };
}
