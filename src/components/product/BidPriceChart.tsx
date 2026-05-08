"use client";

import { ProductBid } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BidPriceChartProps {
  bids: ProductBid[]; // time-ascending order
  startPrice: number;
}

const W = 320;
const H = 140;
const PAD = { top: 12, right: 12, bottom: 28, left: 72 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

export function BidPriceChart({ bids, startPrice }: BidPriceChartProps) {
  if (bids.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center text-sm text-muted-foreground">
        입찰 데이터 없음
      </div>
    );
  }

  const prices = bids.map((b) => b.price);
  const rawMin = Math.min(startPrice, ...prices);
  const rawMax = Math.max(...prices);
  const padding = (rawMax - rawMin) * 0.15 || rawMax * 0.1;
  const minP = rawMin - padding;
  const maxP = rawMax + padding;
  const rangeP = maxP - minP;

  const toX = (i: number) =>
    PAD.left + (bids.length === 1 ? INNER_W / 2 : (i / (bids.length - 1)) * INNER_W);
  const toY = (price: number) =>
    PAD.top + (1 - (price - minP) / rangeP) * INNER_H;

  const pts = bids.map((bid, i) => ({ x: toX(i), y: toY(bid.price), bid }));

  // Smooth path via cubic bezier
  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PAD.top + INNER_H} L ${pts[0].x} ${PAD.top + INNER_H} Z`;

  // Y-axis ticks (3 levels)
  const yTicks = [rawMin, Math.round((rawMin + rawMax) / 2), rawMax];

  // X-axis date labels (first + last)
  const fmtDate = (t: string) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={PAD.left}
          y1={toY(tick)}
          x2={PAD.left + INNER_W}
          y2={toY(tick)}
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#chartGrad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {pts.map(({ x, y, bid }, i) => (
        <circle
          key={bid.productBidId}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 4.5 : 3}
          fill={i === pts.length - 1 ? "var(--color-primary)" : "var(--color-card)"}
          stroke="var(--color-primary)"
          strokeWidth={i === pts.length - 1 ? 0 : 1.5}
        />
      ))}

      {/* Latest price label above last dot */}
      {pts.length > 0 && (
        <text
          x={pts[pts.length - 1].x}
          y={pts[pts.length - 1].y - 8}
          textAnchor={pts.length === 1 ? "middle" : "end"}
          fontSize={9}
          fontWeight="600"
          fill="var(--color-primary)"
          className="font-price"
        >
          {formatCurrency(bids[bids.length - 1].price)}
        </text>
      )}

      {/* Y-axis price labels */}
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={PAD.left - 6}
          y={toY(tick)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.5}
          className="font-price"
        >
          {tick >= 10000
            ? `${Math.round(tick / 10000)}만`
            : tick.toLocaleString()}
        </text>
      ))}

      {/* X-axis date labels */}
      {bids.length > 1 && (
        <>
          <text
            x={pts[0].x}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {fmtDate(bids[0].bidTime)}
          </text>
          <text
            x={pts[pts.length - 1].x}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {fmtDate(bids[bids.length - 1].bidTime)}
          </text>
        </>
      )}
    </svg>
  );
}
