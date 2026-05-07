import type { Product, ProductListResponse, CategoryListResponse } from "@/types";
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_ME,
  MOCK_ORDERS,
  MOCK_DEMO_SELLER,
} from "./data";

// 세션 중에만 유지되는 임시 상태
const _sessionProducts: Product[] = [];
let _nextProductId = 100;
let _mockMeOverrides: { nickname?: string; phoneNumber?: string } = {};

const _mockUsers: Array<{ email: string; nickname: string }> = [
  { email: "demo@example.com", nickname: "데모유저" },
];

function _delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 150));
}

function _createMockToken(email: string, nickname: string): string {
  if (typeof window === "undefined") return "mock.mock.mock";
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const payloadStr = JSON.stringify({
    sub: email,
    nickname,
    role: "ROLE_USER",
    type: "ACCESS",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 30,
  });
  const payload = btoa(unescape(encodeURIComponent(payloadStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `${header}.${payload}.mocksignature`;
}

function _getCurrentNickname(): string {
  if (typeof window === "undefined") return "데모유저";
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return "데모유저";
    const parts = token.split(".");
    if (parts.length < 2) return "데모유저";
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    ) as { nickname?: string };
    return payload.nickname || "데모유저";
  } catch {
    return "데모유저";
  }
}

function _parseUrl(endpoint: string) {
  const base = "http://localhost";
  const full = endpoint.startsWith("/") ? `${base}${endpoint}` : `${base}/${endpoint}`;
  return new URL(full);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

function handleSignIn(body: unknown): { accessToken: string } {
  const { email = "demo@example.com" } = (body as { email?: string; password?: string }) ?? {};
  const existing = _mockUsers.find((u) => u.email === email);
  const nickname = existing?.nickname ?? email.split("@")[0];
  if (!existing) _mockUsers.push({ email, nickname });
  return { accessToken: _createMockToken(email, nickname) };
}

function handleSignUp(body: unknown): Record<string, never> {
  const { email, nickname } = (body as { email?: string; nickname?: string }) ?? {};
  if (email && nickname && !_mockUsers.find((u) => u.email === email)) {
    _mockUsers.push({ email, nickname });
  }
  return {};
}

function handleReissue(): { accessToken: string } {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const parts = token.split(".");
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(
          decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join(""),
          ),
        ) as { sub?: string; nickname?: string };
        return { accessToken: _createMockToken(payload.sub ?? "demo@example.com", payload.nickname ?? "데모유저") };
      } catch {
        // fall through
      }
    }
  }
  return { accessToken: _createMockToken("demo@example.com", "데모유저") };
}

// ── Products ──────────────────────────────────────────────────────────────────

function handleGetProducts(endpoint: string): ProductListResponse {
  const url = _parseUrl(endpoint);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const size = parseInt(url.searchParams.get("size") ?? "6");
  const sort = url.searchParams.get("sort") ?? "createdAt,desc";
  const bidStatusParam = url.searchParams.get("bidStatus");
  const nameQuery = url.searchParams.get("name");

  let filtered = [...MOCK_PRODUCTS, ..._sessionProducts];

  if (bidStatusParam) {
    const statuses = bidStatusParam.split(",");
    filtered = filtered.filter((p) => statuses.includes(p.bidStatus));
  }

  if (nameQuery) {
    const q = nameQuery.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  const [sortField, sortDir] = sort.split(",");
  filtered.sort((a, b) => {
    let av: number | string = a.createdAt;
    let bv: number | string = b.createdAt;
    if (sortField === "bidEndDate") { av = a.bidEndDate; bv = b.bidEndDate; }
    else if (sortField === "bidPrice") { av = a.bidPrice; bv = b.bidPrice; }
    else if (sortField === "bidCount") { av = a.bidCount; bv = b.bidCount; }
    if (sortDir === "desc") return av > bv ? -1 : av < bv ? 1 : 0;
    return av > bv ? 1 : av < bv ? -1 : 0;
  });

  const total = filtered.length;
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    first: page === 0,
    last: start + size >= total,
    size,
    number: page,
    numberOfElements: content.length,
    empty: content.length === 0,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { empty: false, sorted: true, unsorted: false },
      offset: start,
      paged: true,
      unpaged: false,
    },
    sort: { empty: false, sorted: true, unsorted: false },
  };
}

function handleGetProductDetail(id: number): Product {
  const session = _sessionProducts.find((p) => p.id === id);
  if (session) return session;
  const found = MOCK_PRODUCTS.find((p) => p.id === id);
  if (found) return found;
  // 알 수 없는 ID는 첫 번째 상품으로 대체
  return MOCK_PRODUCTS[0];
}

function handleCreateProduct(body: unknown): { id: number } {
  const data = body as {
    name?: string;
    description?: string;
    categoryId?: number;
    price?: number;
    bidEndDate?: string | null;
    productStatus?: Product["productStatus"];
    thumbnail?: string;
    imageUrls?: string[];
  };

  const categoryId = data.categoryId ?? 1;
  const category = MOCK_CATEGORIES.find((c) => c.id === categoryId) ?? MOCK_CATEGORIES[0];
  const bidEndDate = data.bidEndDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const price = data.price ?? 0;
  const id = _nextProductId++;

  const newProduct: Product = {
    id,
    name: data.name ?? "새 상품",
    description: data.description ?? "",
    category,
    startPrice: price,
    bidPrice: price,
    bidCount: 0,
    bidStatus: "NOT_BIDDED",
    productStatus: data.productStatus ?? "GOOD",
    thumbnail: "/product01.jpeg",
    imageUrls: [{ id: id * 100, imageUrl: "/product01.jpeg" }],
    user: { ...MOCK_DEMO_SELLER, nickname: _getCurrentNickname() },
    createdAt: new Date().toISOString(),
    bidEndDate,
    modifiedAt: new Date().toISOString(),
    productBids: [],
  };

  _sessionProducts.push(newProduct);
  return { id };
}

function handleGetCategories(): CategoryListResponse {
  return {
    content: MOCK_CATEGORIES,
    totalElements: MOCK_CATEGORIES.length,
    totalPages: 1,
    first: true,
    last: true,
    size: 50,
    number: 0,
    numberOfElements: MOCK_CATEGORIES.length,
    empty: false,
    pageable: {
      pageNumber: 0,
      pageSize: 50,
      sort: { empty: false, sorted: true, unsorted: false },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    sort: { empty: false, sorted: true, unsorted: false },
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

function handleGetMe(): typeof MOCK_ME {
  const nickname = _mockMeOverrides.nickname ?? _getCurrentNickname();
  const phoneNumber = _mockMeOverrides.phoneNumber ?? MOCK_ME.phoneNumber;
  return { ...MOCK_ME, nickname, phoneNumber };
}

function handleUpdateMe(body: unknown): Record<string, never> {
  const data = body as { nickname?: string; phoneNumber?: string };
  if (data.nickname) _mockMeOverrides.nickname = data.nickname;
  if (data.phoneNumber) _mockMeOverrides.phoneNumber = data.phoneNumber;
  return {};
}

// ── Orders ────────────────────────────────────────────────────────────────────

function handleGetOrder(id: number): (typeof MOCK_ORDERS)[number] {
  return MOCK_ORDERS[id] ?? MOCK_ORDERS[1];
}

// ── 메인 라우터 ──────────────────────────────────────────────────────────────

export async function mockFetch<T>(
  endpoint: string,
  method: string,
  bodyStr?: string,
): Promise<T> {
  await _delay();

  const body = bodyStr ? JSON.parse(bodyStr) : undefined;
  const url = _parseUrl(endpoint);
  const path = url.pathname;

  // Auth
  if (path.includes("/api/auth/sign-in"))  return handleSignIn(body) as T;
  if (path.includes("/api/auth/sign-up"))  return handleSignUp(body) as T;
  if (path.includes("/api/auth/logout"))   return {} as T;
  if (path.includes("/api/auth/reissue"))  return handleReissue() as T;

  // Products — 카테고리 먼저 (경로 포함 관계 주의)
  if (path.includes("/api/products/categories")) return handleGetCategories() as T;

  const productDetailMatch = path.match(/^\/api\/products\/(\d+)$/);
  if (productDetailMatch) return handleGetProductDetail(parseInt(productDetailMatch[1])) as T;

  if (path === "/api/products" || path.startsWith("/api/products?")) {
    if (method.toUpperCase() === "POST") return handleCreateProduct(body) as T;
    return handleGetProducts(endpoint) as T;
  }
  // 쿼리 스트링이 있는 경우도 커버
  if (path === "/api/products") {
    if (method.toUpperCase() === "POST") return handleCreateProduct(body) as T;
    return handleGetProducts(endpoint) as T;
  }

  // Users
  if (path === "/api/users/me") {
    if (method.toUpperCase() === "PUT") return handleUpdateMe(body) as T;
    return handleGetMe() as T;
  }

  // Orders — shipping-info 먼저
  const shippingMatch = path.match(/^\/api\/orders\/(\d+)\/shipping-info$/);
  if (shippingMatch) return {} as T;

  const orderMatch = path.match(/^\/api\/orders\/(\d+)$/);
  if (orderMatch) return handleGetOrder(parseInt(orderMatch[1])) as T;

  // S3
  if (path.includes("/api/s3/upload-url")) {
    const { uploadUrls = [] } = (body as { uploadUrls?: string[] }) ?? {};
    return uploadUrls.map(() => "https://mock-s3.example.com/noop") as T;
  }

  // Payments confirm
  if (path.includes("/api/payments")) return {} as T;

  console.warn(`[MockAPI] 핸들러 없음: ${method} ${endpoint}`);
  return {} as T;
}
