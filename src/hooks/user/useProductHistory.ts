import { useEffect, useMemo, useReducer } from "react";
import type { MypageProductBid, Order, Product } from "@/types";
import type { MeResponse } from "./useMe";

interface ProductHistoryState {
  sellingProducts: Product[];
  purchaseBidding: MypageProductBid[];
  orders: Order[];
  isLoading: boolean;
}

const initialState: ProductHistoryState = {
  sellingProducts: [],
  purchaseBidding: [],
  orders: [],
  isLoading: true,
};

type ProductHistoryAction = {
  type: "SET_DATA";
  payload: ProductHistoryState;
};

function reducer(
  state: ProductHistoryState,
  action: ProductHistoryAction,
): ProductHistoryState {
  switch (action.type) {
    case "SET_DATA":
      return action.payload;
    default:
      return state;
  }
}

export function useProductHistory(
  meData: MeResponse | null,
  isMeLoading: boolean,
) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (isMeLoading) {
      return;
    }

    // orders 데이터를 매핑: product 객체에서 thumbnail과 imageUrls 추출
    const mappedOrders =
      meData?.orders?.map((order) => ({
        ...order,
        thumbnail: order.product?.thumbnail,
        imageUrls: order.product?.imageUrls,
      })) ?? [];

    dispatch({
      type: "SET_DATA",
      payload: {
        sellingProducts: meData?.products ?? [],
        purchaseBidding: meData?.productBids ?? [],
        orders: mappedOrders,
        isLoading: false,
      },
    });
  }, [isMeLoading, meData]);

  const {
    bidding: sellingBidding,
    pending: sellingPending,
    completed: sellingCompleted,
  } = useMemo(() => {
    const biddingStatuses = ["NOT_BIDDED", "BIDDED"];
    const pendingStatuses = ["PAYMENT_WAITING"];
    const completedStatuses = ["COMPLETED", "NO_BIDDER"];

    const bidding = state.sellingProducts.filter((p) =>
      biddingStatuses.includes(p.bidStatus),
    );
    const pending = state.sellingProducts.filter((p) =>
      pendingStatuses.includes(p.bidStatus),
    );
    const completed = state.sellingProducts.filter((p) =>
      completedStatuses.includes(p.bidStatus),
    );

    return {
      bidding,
      pending,
      completed,
    };
  }, [state.sellingProducts]);

  // 구매 주문 필터링
  const paymentPendingOrders = useMemo(
    () =>
      state.orders.filter((order) => order.orderStatus === "PAYMENT_PENDING"),
    [state.orders],
  );

  const completedOrders = useMemo(
    () => state.orders.filter((order) => order.orderStatus === "PAID"),
    [state.orders],
  );

  return {
    // 판매 관련
    sellingProducts: state.sellingProducts,
    sellingBidding,
    sellingPending,
    sellingCompleted,

    // 구매 관련
    purchaseBidding: state.purchaseBidding,
    orders: state.orders,
    paymentPendingOrders,
    completedOrders,

    // 상태
    isLoading: state.isLoading,
  };
}
