export default function Footer() {
  return (
    <footer className="hidden border-t border-gray-200 bg-gray-50 md:block">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* 상단: 브랜드 + 링크 */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* 브랜드 */}
          <div className="flex flex-col gap-2">
            <span className="text-base font-bold text-gray-900">
              🐔 블라인드 치킨 마켓
            </span>
            <p className="max-w-xs text-sm text-gray-500">
              익명 기반 중고 경매 거래 플랫폼.
              <br />
              누구나 안전하게 사고 팔 수 있는 공간입니다.
            </p>
          </div>

          {/* 링크 그룹 */}
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">서비스</span>
              <a href="/" className="text-gray-500 hover:text-gray-800">
                홈
              </a>
              <a
                href="/products/create"
                className="text-gray-500 hover:text-gray-800"
              >
                상품 등록
              </a>
              <a href="/mypage" className="text-gray-500 hover:text-gray-800">
                마이페이지
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">고객지원</span>
              <span className="cursor-default text-gray-500">공지사항</span>
              <span className="cursor-default text-gray-500">
                자주 묻는 질문
              </span>
              <span className="cursor-default text-gray-500">1:1 문의</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">정책</span>
              <span className="cursor-default text-gray-500">이용약관</span>
              <span className="cursor-default text-gray-500">
                개인정보처리방침
              </span>
              <span className="cursor-default text-gray-500">
                전자금융거래이용약관
              </span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <hr className="my-6 border-gray-200" />

        {/* 하단: 사업자 정보 + 저작권 */}
        <div className="flex flex-col gap-3 text-xs text-gray-400 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 leading-relaxed">
            <p>
              <span className="font-medium text-gray-500">Darius Team</span>
              &nbsp;·&nbsp; 대표: 남경진 &nbsp;·&nbsp; 사업자등록번호:
              000-00-00000
            </p>
            <p>
              주소: 서울특별시 강남구 테헤란로 123 BCM빌딩 &nbsp;·&nbsp; 이메일:
              nkj960425@naver.com &nbsp;·&nbsp; 대표번호: 02-000-0000
            </p>
            <p>
              통신판매업 신고번호: 제2025-서울강남-0000호 &nbsp;·&nbsp; 호스팅
              서비스: Vercel Inc.
            </p>
          </div>
          <p className="shrink-0">© 2025 Darius Team. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
