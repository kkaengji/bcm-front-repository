"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "./MobileBottomNav";

export default function ClientBottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) return null;
  return <MobileBottomNav />;
}
