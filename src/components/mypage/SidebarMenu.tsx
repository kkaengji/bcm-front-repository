"use client";

import Link from "next/link";
import { ShoppingBag, Package, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/user/useAuth";

const menus = [
  { href: "#purchase", icon: ShoppingBag, label: "구매 내역" },
  { href: "#sales", icon: Package, label: "판매 내역" },
  { href: "#wishlist", icon: Heart, label: "찜한 상품" },
];

export default function SidebarMenu() {
  const { user } = useAuth();

  return (
    <aside className="min-w-0 shrink-0 lg:w-52">
      <div className="sticky top-16 space-y-3">
        <h2 className="text-foreground text-lg font-black">마이페이지</h2>

        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {menus.map((menu) => (
            <a
              key={menu.href}
              href={menu.href}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-card/50 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground lg:border-0 lg:bg-transparent"
            >
              <menu.icon className="h-4 w-4 shrink-0" />
              {menu.label}
            </a>
          ))}
        </nav>

        {/* 상품 등록 바로가기 */}
        {user && (
          <div className="border-t border-white/8 pt-3 lg:mt-4 lg:pt-4">
            <Button
              asChild
              size="sm"
              className="w-full rounded-xl text-xs font-semibold shadow-md shadow-primary/20"
            >
              <Link href="/products/create">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> 상품 등록
              </Link>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
