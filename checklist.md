# BCM 작업 체크리스트

## 디자인 리뉴얼

- [x] `globals.css` — OKLCH 컬러 시스템, BCM 토큰(`--bcm-urgent`, `--bcm-live`), `.font-price`, `.shimmer`
- [x] `layout.tsx` — Inter + Noto Sans KR 폰트, 강제 다크모드
- [x] `Navigation.tsx` — backdrop-blur, 로고 amber 강조
- [x] `MobileBottomNav.tsx` — 활성 색상 primary로 통일
- [x] `HeroSection.tsx` — ambient glow, spring 애니메이션, Live Auctions 뱃지
- [x] `ProductsGrid.tsx` — stagger 애니메이션
- [x] `ProductsHeader.tsx` — 셀렉트 박스 스타일
- [x] `ProductCard.tsx` — whileHover, 이미지 내 그라디언트 오버레이, 블라인드 타이머 뱃지
- [x] `ProductCardSkeleton.tsx` — shimmer 효과
- [x] `ProductImageGallery.tsx` — rounded-2xl, backdrop-blur 네비 버튼
- [x] `button.tsx` — hover shadow, lg 사이즈 조정
- [x] `badge.tsx` — primary/15 배경, 11px 폰트

## 찜 기능

- [x] `useWishlist.ts` — localStorage 기반, toggle / isWishlisted / count
- [x] `WishlistButton.tsx` — Heart 토글 버튼, stopPropagation 처리
- [x] `ProductCard.tsx` — 우상단 찜 버튼 오버레이
- [x] `products/[id]/page.tsx` — 상품명 옆 찜 버튼
- [x] `WishlistSection.tsx` — 찜한 상품 그리드, 블라인드 타이머 뱃지, 빈 상태 UI
- [x] `mypage/page.tsx` — 찜한 상품 섹션(`#wishlist`) 추가

## 마이페이지 강화

- [x] `ProfileSection.tsx` — 활동 통계 카드 4개(총 입찰/판매중/낙찰완료/찜), 별점 표시
- [x] `SidebarMenu.tsx` — 아이콘 메뉴(구매/판매/찜), 상품 등록 바로가기 버튼
- [x] `ProductListItem.tsx` — 카드형 디자인, 썸네일 h-16 w-16
- [x] `PurchaseHistorySection.tsx` — 리스트 래퍼 → space-y-2, 요약바 rounded-xl
- [x] `SalesHistorySection.tsx` — 리스트 래퍼 → space-y-2, 요약바 rounded-xl
- [x] `mypage/page.tsx` — stats props 전달(useWishlist count 포함)

## 경매 UX 개선

- [x] `utils.ts` — `getBlindTimeText()`, `BLIND_THRESHOLD_MS`(24시간) 추가
- [x] `ProductCard.tsx` — 블라인드 타이머(24시간 이내 → "마감 임박 🔥" animate-pulse)
- [x] `ProductBidForm.tsx` — 빠른 입찰 버튼(최소/+1만/+5만), 입찰 확인 Dialog 모달
- [x] `useProductDetail.ts` — `isConnected` state, onConnect/onDisconnect 연동
- [x] `ProductBidHistory.tsx` — 실시간 연결 인디케이터, "나" 뱃지, spring 애니메이션
- [x] `products/[id]/page.tsx` — 뷰어 수(결정론적 fake), 최고입찰자 배지, 추월 알림 배지, 가격 flash 애니메이션, 블라인드 타이머

---

## 남은 작업 (낮은 우선순위)

- [ ] `app/login/page.tsx` — 글래스 카드 디자인
- [ ] `app/signup/page.tsx` — 글래스 카드 디자인
- [ ] `components/user/FormInput.tsx` — 인풋 스타일 통일
- [ ] `components/payment/PaymentSummary.tsx` — 카드 스타일
- [ ] `components/payment/ShippingForm.tsx` — 카드 스타일, bcm-urgent 에러 색상
- [ ] `app/payment/[orderId]/page.tsx` — font-black 헤딩, 에러 배너 bcm-urgent
