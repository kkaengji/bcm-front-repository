/**
 * 공통 타입 (모든 도메인에서 사용)
 */

// 정렬 정보
export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// 페이지 정보
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// 카테고리
export interface Category {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
}

// 카테고리 응답
export interface CategoryListResponse {
  content: Category[];
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
