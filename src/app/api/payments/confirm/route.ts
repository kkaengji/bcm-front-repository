import { NextRequest, NextResponse } from "next/server";

/**
 * 토스페이먼츠 결제 승인 API
 * POST /api/payments/confirm
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error("결제 승인 요청 JSON 파싱 실패:", error);
      return NextResponse.json(
        { message: "유효한 JSON 요청이 필요합니다." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "유효한 요청 형식이 아닙니다." },
        { status: 400 },
      );
    }

    const { paymentKey, orderId, amount } = body as Record<string, unknown>;

    // 필수 파라미터 검증
    if (typeof paymentKey !== "string" || typeof orderId !== "string") {
      return NextResponse.json(
        { message: "paymentKey와 orderId는 문자열이어야 합니다." },
        { status: 400 },
      );
    }

    if (!paymentKey || !orderId || amount === undefined || amount === null) {
      return NextResponse.json(
        { message: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "amount는 0보다 큰 숫자여야 합니다." },
        { status: 400 },
      );
    }

    // 토스페이먼츠 시크릿 키 (환경변수에서 가져오기)
    // 테스트 환경에서는 test_gsk_로 시작하는 시크릿 키 사용
    const secretKey = process.env.TOSS_SECRET_KEY;

    if (!secretKey) {
      console.error("환경변수 TOSS_SECRET_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { message: "서버 설정 오류: 결제 키가 누락되었습니다." },
        { status: 500 },
      );
    }

    // Base64 인코딩 (시크릿 키 + 콜론)
    const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      },
    ).catch((error) => {
      console.error("토스페이먼츠 API 네트워크 오류:", error);
      throw new Error("PAYMENT_NETWORK_ERROR");
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("토스페이먼츠 결제 승인 실패:", data);

      // 토스 에러 코드와 상태에 따른 사용자 메시지 매핑
      const status = response.status;
      const code = data.code as string | undefined;

      // 4xx: 사용자/요청 문제, 5xx: 토스 서버 문제
      const messageByStatus =
        status >= 500
          ? "결제 승인 서버와 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
          : data.message || "결제 승인에 실패했습니다.";

      return NextResponse.json(
        {
          message: messageByStatus,
          code,
        },
        { status },
      );
    }

    // 결제 승인 성공
    console.log("결제 승인 성공:", data);

    // TODO: 여기서 추가로 데이터베이스에 결제 정보를 저장하거나
    // 주문 상태를 업데이트하는 로직을 추가할 수 있습니다.

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("결제 승인 API 오류:", error);
    if (error instanceof Error && error.message === "PAYMENT_NETWORK_ERROR") {
      return NextResponse.json(
        { message: "결제 승인 서버와 통신 중 문제가 발생했습니다." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
