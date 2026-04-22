"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "@/types";
import { apiGet } from "@/lib/api";
import {
  formatCurrency,
  isAuctionExpired,
  getMinBidIncrement,
  getTimeRemainingText,
} from "@/lib/utils";
import {
  WEBSOCKET_CONFIG,
  BID_AMOUNT_LIMITS,
  API_BASE_URL,
} from "@/lib/constants";
import mockData from "@/mocks/products.json";
import SockJs from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface UseProductDetailParams {
  params: Promise<{ id: string }> | { id: string };
  userEmail?: string;
}

export function useProductDetail({
  params,
  userEmail,
}: UseProductDetailParams) {
  const clientRef = useRef<Client | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidForm, setShowBidForm] = useState(false);
  const [productId, setProductId] = useState<string>("");
  const [priceKey, setPriceKey] = useState(0);
  const [showAllBids, setShowAllBids] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // productId 초기화
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setProductId(resolvedParams.id);
    };

    initializeParams();
  }, [params]);

  // 상품 데이터 설정 및 최소 입찰가 초기화
  const setProductData = useCallback((productData: Product, isMock = false) => {
    setProduct(productData);
    if (isMock) setIsUsingMockData(true);
    const minIncrement = getMinBidIncrement(productData.bidPrice);
    setBidAmount((productData.bidPrice + minIncrement).toString());
    setError(null);
  }, []);

  // API 호출 - 상품 데이터 로드
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const product = await apiGet<Product>(`/api/products/${productId}`);
        setProductData(product);
      } catch (err) {
        console.error("상품 조회 실패:", err);
        // API 호출 실패 시 목 데이터에서 찾기
        const mockProducts = Array.isArray(mockData)
          ? mockData
          : (mockData as unknown as { content: Product[] })?.content || [];
        const mockProduct = mockProducts.find(
          (p) => String(p?.id) === productId,
        );
        if (mockProduct) {
          console.log("mock 데이터에서 상품을 불러왔습니다.");
          setProductData(mockProduct as Product, true);
        } else {
          setError("상품을 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, setProductData]);

  // WebSocket 연결
  useEffect(() => {
    if (!productId || !product) return;

    // 목 데이터 사용 중이면 WebSocket 연결하지 않음
    if (isUsingMockData) {
      console.log("mock 데이터 사용 중으로 WebSocket을 연결하지 않습니다.");
      return;
    }

    // 경매가 마감되었으면 WebSocket 연결하지 않음
    if (
      product.bidStatus === "COMPLETED" ||
      new Date() > new Date(product.bidEndDate)
    ) {
      console.log("경매가 마감되어 WebSocket을 연결하지 않습니다.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJs(`${API_BASE_URL}/connect`),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_DELAY,
      heartbeatIncoming: WEBSOCKET_CONFIG.HEARTBEAT_INCOMING,
      heartbeatOutgoing: WEBSOCKET_CONFIG.HEARTBEAT_OUTGOING,
    });

    clientRef.current = client;

    clientRef.current.onConnect = () => {
      console.log("WebSocket connected");

      clientRef.current?.subscribe(
        `/topic/products/${productId}/product-bids`,
        (msg) => {
          const newBid = JSON.parse(msg.body);

          setProduct((prev) => {
            if (!prev) return prev;

            const updatedProduct = { ...prev };
            updatedProduct.bidPrice = newBid.price;
            updatedProduct.bidCount += 1;

            // 입찰 기록에 새 입찰 추가
            // 백엔드에서 완전한 ProductBid 객체를 전달받는 것을 권장
            // 임시 방편으로 timestamp + random으로 충돌 최소화
            if (updatedProduct.productBids) {
              const tempBid = {
                productBidId: newBid.productBidId || Date.now() + Math.random(),
                price: newBid.price,
                bidTime: newBid.bidTime || new Date().toISOString(),
                bidderNickname: newBid.bidderNickname || "익명",
              };

              updatedProduct.productBids = [
                tempBid,
                ...updatedProduct.productBids,
              ];
            }

            return updatedProduct;
          });

          // 입찰가 입력값을 새로운 최소 입찰가로 업데이트
          const minIncrement = getMinBidIncrement(newBid.price);
          setBidAmount((newBid.price + minIncrement).toString());

          // 가격 애니메이션 트리거
          setPriceKey((prev) => prev + 1);
        },
      );
    };

    clientRef.current.activate();

    return () => {
      clientRef.current?.deactivate();
      console.log("WebSocket disconnected");
    };
  }, [productId, product, isUsingMockData]);

  // 경매 마감 여부 확인
  const checkIsAuctionExpired = useCallback(() => {
    if (!product) return false;
    return isAuctionExpired(product.bidEndDate);
  }, [product]);

  // 남은 시간 계산
  const getTimeRemaining = useCallback(() => {
    if (!product) return null;
    return getTimeRemainingText(product.bidEndDate);
  }, [product]);

  // 이미지 네비게이션
  const handlePrevImage = useCallback(() => {
    if (!product?.imageUrls || product.imageUrls.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.imageUrls.length - 1 : prev - 1,
    );
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product?.imageUrls || product.imageUrls.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === product.imageUrls.length - 1 ? 0 : prev + 1,
    );
  }, [product]);

  // 입찰 금액 변경
  const handleBidAmountChange = useCallback((value: string) => {
    // 최대 입찰 금액 제한
    if (
      value === "" ||
      (value.length <= BID_AMOUNT_LIMITS.MAX_DIGITS &&
        Number(value) < BID_AMOUNT_LIMITS.MAX_AMOUNT)
    ) {
      setBidAmount(value);
      setBidError(null);
    }
  }, []);

  // 입찰하기
  const handlePlaceBid = useCallback(() => {
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setBidError("입찰가를 입력해주세요.");
      return;
    }

    const bidValue = Number(bidAmount);
    const minIncrement = product ? getMinBidIncrement(product.bidPrice) : 1000;
    const minBidValue = product ? product.bidPrice + minIncrement : 0;

    // 최소 입찰가 검증
    if (bidValue < minBidValue) {
      setBidError(
        `최소 입찰가는 ${formatCurrency(minBidValue)}입니다. (최소 입찰 단위: ${formatCurrency(minIncrement)})`,
      );
      return;
    }

    setBidError(null);

    clientRef.current?.publish({
      destination: `/publish/products/${productId}/product-bids`,
      body: JSON.stringify({
        price: bidValue,
        email: userEmail,
      }),
    });

    setShowBidForm(false);
  }, [bidAmount, product, productId, userEmail]);

  // 최소 입찰가 계산
  const minBidIncrement = product ? getMinBidIncrement(product.bidPrice) : 0;
  const minBidValue = product ? product.bidPrice + minBidIncrement : 0;

  return {
    product,
    isLoading,
    error,
    bidAmount,
    showBidForm,
    setShowBidForm,
    priceKey,
    showAllBids,
    setShowAllBids,
    bidError,
    currentImageIndex,
    setCurrentImageIndex,
    minBidIncrement,
    minBidValue,
    checkIsAuctionExpired,
    getTimeRemaining,
    handlePrevImage,
    handleNextImage,
    handleBidAmountChange,
    handlePlaceBid,
  };
}
