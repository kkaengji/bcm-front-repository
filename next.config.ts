import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    unoptimized: true, // 로컬 blob URL 지원
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // 프론트엔드에서 /api/ 로 시작하는 요청이 오면
        destination: "http://localhost:8080/api/:path*", // 백엔드 8080 포트로 보낸다
      },
    ];
  },
};

export default nextConfig;
