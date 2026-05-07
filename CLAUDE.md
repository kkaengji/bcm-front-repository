# Blind Chicken Market – Frontend

익명 기반 중고 경매 거래 플랫폼의 프론트엔드. 상품 등록 → 실시간 입찰 → 낙찰 → 결제까지 전체 거래 플로우를 구현한다.  
원래 Spring Boot 백엔드와 연동한 팀 프로젝트였으며, 현재는 **Mock API 모드**로 백엔드 없이 단독으로 동작하는 포트폴리오 버전을 유지하고 있다.

원본 팀 레포: https://github.com/kt-merge/bcm-front-repository

## 기술 스택

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** strict mode
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI 기반)
- **framer-motion** — 페이지·컴포넌트 전환 애니메이션
- **@stomp/stompjs** + **sockjs-client** — 실시간 경매 WebSocket
- **TossPayments 위젯** — 결제 처리 (시크릿 키는 서버 사이드 전용)
- **AWS S3** — 이미지 업로드 (Mock 모드에서는 더미 URL 반환)

## 개발 명령어

```bash
npm run dev      # 개발 서버 (포트 3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

### 환경 변수 (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TOSS_CLIENT_KEY=

# 포트폴리오/데모 모드 — "true"로 설정 시 실제 API 대신 Mock 응답 사용
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_USE_MOCK_WHEN_EMPTY=   # 미설정 시 개발 환경에서만 자동 활성화

TOSS_SECRET_KEY=   # 서버 사이드 전용 — 클라이언트 번들에 포함 금지
```

`next.config.ts`에 `/api/*` → `http://localhost:8080/api/*` 리라이트가 설정되어 있어 Mock 비활성화 상태에서도 개발 환경에서 CORS 없이 백엔드와 통신한다.

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router 페이지
│   ├── api/payments/confirm/     # TossPayments 결제 승인 (서버 사이드 Route)
│   ├── layout.tsx                # 루트 레이아웃 — AuthProvider 단일 마운트
│   ├── products/[id]/            # 상품 상세 + 실시간 경매
│   └── payment/[orderId]/        # 결제 페이지 (IDOR 방어)
├── components/                   # UI 컴포넌트 (로직 없음, hooks에 위임)
│   ├── common/                   # 네비게이션, 검색 모달 등 공통
│   ├── home/                     # 히어로, 상품 그리드, 무한 스크롤
│   ├── product/                  # 상품 카드, 입찰 폼, 이미지 갤러리
│   ├── payment/                  # 결제 위젯, 배송 폼, 주소 검색
│   ├── mypage/                   # 프로필, 거래 내역
│   ├── user/                     # 로그인/회원가입 폼
│   └── ui/                       # shadcn/ui 기본 컴포넌트
├── hooks/                        # 비즈니스 로직 (컴포넌트에서 분리)
│   ├── useProductDetail.ts       # 상품 조회 + WebSocket 입찰 연동
│   ├── useInfiniteProducts.ts    # Intersection Observer 무한 스크롤
│   ├── useCreateProductForm.ts   # 상품 등록 폼 상태 + 유효성 검사
│   ├── payment/usePaymentOrder.ts    # 주문 조회 + IDOR 접근 제어
│   ├── payment/useTossPayments.ts    # TossPayments 위젯 초기화
│   └── user/useAuth.tsx              # JWT 인증 Context
├── lib/
│   ├── api.ts        # Fetch 래퍼 — 토큰 자동 포함 + 재발급 큐잉 (Mutex 패턴)
│   ├── constants.ts  # WebSocket 설정, 입찰 제한, Mock 플래그 등 상수
│   ├── errors.ts     # 에러 정규화 및 사용자 메시지 변환
│   └── utils.ts      # 날짜/통화 포맷, JWT 디코딩 유틸
├── mocks/
│   ├── data.ts       # 목 상품·카테고리·주문·유저 데이터
│   └── handlers.ts   # API 엔드포인트별 목 핸들러 (mockFetch 함수)
└── types/            # TypeScript 타입 정의 (백엔드 API 스펙 기반)
    ├── auth.ts, product.ts, order.ts, payment.ts, common.ts, error.ts, index.ts
```

## 핵심 아키텍처 패턴

### Mock API 모드 (`src/mocks/`)

`NEXT_PUBLIC_USE_MOCK_API=true` 환경변수를 설정하면 `apiFetch`가 실제 네트워크 요청 없이 `mockFetch`로 라우팅된다. `handlers.ts`에서 URL 패턴 매칭으로 Auth·Products·Users·Orders 엔드포인트를 처리하며, 세션 중 생성된 상품은 `_sessionProducts` 배열에 유지된다. Vercel 포트폴리오 배포 시 이 모드를 사용한다.

### API 래퍼 (`src/lib/api.ts`)

커스텀 Fetch 래퍼. **Mutex 패턴**으로 401 발생 시 토큰 재발급을 정확히 1회만 수행하고, 대기 중인 요청들은 `refreshSubscribers` 큐에 등록해 새 토큰 발급 후 일괄 재시도한다.

- Access Token: `localStorage` 저장
- Refresh Token: `httpOnly + Secure + SameSite` 쿠키 (JS 접근 불가)

### 실시간 경매 (`src/hooks/useProductDetail.ts`)

- 경매 종료 여부(`bidStatus === "COMPLETED"` 또는 `bidEndDate` 초과)를 사전 확인해 불필요한 WebSocket 연결 자체를 차단
- `useRef`로 STOMP 클라이언트 인스턴스 관리 → 언마운트 시 `deactivate()` 보장
- STOMP 채널: `/topic/products/{id}/product-bids`

### IDOR 방어 (`src/hooks/payment/usePaymentOrder.ts`)

결제 페이지 진입 시 서버에서 주문 소유자를 검증한다. 403/404 응답 시 메인 페이지로 리다이렉트. 클라이언트 라우팅 제어만으로는 URL 직접 입력을 막을 수 없으므로 서버 응답 기준으로 처리한다.

### 결제 (`src/app/api/payments/confirm/route.ts`)

TossPayments 시크릿 키는 Next.js API Route에서만 사용한다. 클라이언트 번들에 절대 포함되지 않는다.

## 코드 스타일

- **컴포넌트 ↔ 훅 분리 원칙**: UI 컴포넌트는 렌더링만 담당, 비즈니스 로직은 `hooks/`에 위임
- Formatter: Prettier (`prettier-plugin-tailwindcss`)
- Linter: ESLint (Next.js 권장 설정)
- TypeScript strict mode — `src/types/`에 API 응답 타입 정의 필수

## 주의사항

- `TOSS_SECRET_KEY`는 `NEXT_PUBLIC_` 접두어 없이 사용 — 서버 사이드 전용
- WebSocket 훅 수정 시 cleanup (`deactivate()`) 누락 주의 — 중복 구독 버그 재발 가능
- 토큰 재발급 로직(`api.ts`) 수정 시 `isRefreshing` 플래그와 `refreshSubscribers` 큐 동기화 유지
- API 응답 타입 변경 시 `src/types/`를 먼저 수정해 컴파일 오류로 조기 발견
- Mock 핸들러(`handlers.ts`) 수정 시 실제 API 스펙과의 일관성을 함께 확인
