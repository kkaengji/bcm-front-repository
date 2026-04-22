"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/user/useAuth";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: "/", icon: Home, label: "홈", onClick: undefined },
    {
      href: "/products/create",
      icon: PlusCircle,
      label: "등록",
      onClick: undefined,
    },
    {
      href: user ? "/mypage" : "/login",
      icon: User,
      label: "마이",
      onClick: undefined,
    },
  ];

  return (
    <>
      <nav className="bg-background/50 border-border fixed bottom-6 left-1/2 z-50 flex min-w-[220px] -translate-x-1/2 transform items-center rounded-full border px-7 py-3 shadow-md backdrop-blur-sm">
        <div className="flex w-full items-end justify-between gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            const baseClasses = `flex items-center justify-center p-1 transition-colors duration-200 rounded-full ${
              active
                ? "text-red-600"
                : "text-muted-foreground hover:text-red-400"
            }`;

            const IconSize = "h-8 w-8";

            if (item.onClick) {
              return (
                <button
                  key={`dock-${item.href}`}
                  onClick={item.onClick}
                  className={baseClasses}
                  aria-label={item.label}
                >
                  <Icon className={IconSize} />
                </button>
              );
            }

            return (
              <Link
                key={`dock-${item.href}`}
                href={item.href}
                className={baseClasses}
                aria-label={item.label}
              >
                <Icon className={IconSize} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
