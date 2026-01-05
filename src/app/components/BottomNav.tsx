"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/myOrders", label: "My Orders" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-50 sm:hidden
        border-t border-slate-200 bg-white/95 backdrop-blur
        pb-[env(safe-area-inset-bottom)]
      "
      aria-label="Bottom Navigation"
    >
      <div className="mx-auto max-w-6xl px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "text-center rounded-xl px-3 py-2 text-sm font-semibold transition border",
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
