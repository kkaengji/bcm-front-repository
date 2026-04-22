/**
 * 상품 관련 타입
 */

import type { Category } from "./common";
import type { ProductStatus, BidStatus } from "@/lib/constants";
import type { Pageable, Sort } from "./common";

// 이미지 URL
export interface ProductImage {
  id: number;
  imageUrl: string;
}

// GET 상품 상세
export interface Product {
  id: number;
  name: string;
  description: string;
  category: Category;
  startPrice: number;
  bidPrice: number;
  bidCount: number;
  bidStatus: BidStatus;
  productStatus: ProductStatus;
  thumbnail: string;
  imageUrls: ProductImage[];
  user: {
    id: number;
    nickname: string;
    email: string;
    role: "USER" | "ADMIN";
    phoneNumber: string;
  };
  createdAt: string;
  bidEndDate: string;
  modifiedAt: string;
  productBids: ProductBid[];
}

export interface WinnerDetails {
  bidPrice: number;
  productId: string;
  productName: string;
  productStatus: ProductStatus;
}

export interface MypageProductBid {
  productId: number;
  productName: string;
  price: number;
  bidderNickname: string;
  bidTime: string;
  bidCount: number;
  thumbnail?: string;
  imageUrls?: ProductImage[];
}

export interface ProductBid {
  productBidId: number;
  price: number;
  bidderNickname: string;
  bidTime: string;
}

// POST 상품 등록
export interface CreateProductRequest {
  name: string;
  description: string;
  categoryId: number;
  price: number;
  bidEndDate: string;
  productStatus: ProductStatus;
  thumbnail: string;
  imageUrls: string[];
}

// GET 상품 리스트
export interface ProductListResponse {
  content: Product[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

// 상품 등록/폼 상태
export type ProductFormData = {
  name: string;
  description: string;
  category: string;
  startPrice: string; // string으로 입력받고, 전송 시 number로 변환
  bidEndDate?: string; // 경매 종료 날짜 (YYYY-MM-DD)
  productStatus: ProductStatus;
};

// 입찰 내역
export interface Bid {
  bidder: string;
  amount: number;
  time: string;
}
