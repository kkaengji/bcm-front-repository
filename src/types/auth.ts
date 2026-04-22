/**
 * 인증 관련 타입
 */

// POST 회원가입
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
}

// POST 로그인 요청 및 응답
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  // refreshToken은 HttpOnly 쿠키로 전달되므로 응답 바디에 포함하지 않음
}

// JWT 토큰 페이로드
export interface JWTPayload {
  sub: string; // 이메일
  role: string; // 권한
  nickname: string; // 닉네임
  type: string; // 토큰 타입
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}

// 토큰 재발급 응답
export interface ReissueResponse {
  accessToken: string;
}

// Auth Context
export interface User {
  id: number;
  nickname: string;
  email: string;
  role: "USER" | "ADMIN";
  phoneNumber: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateNickname: (nickname: string) => void;
}
