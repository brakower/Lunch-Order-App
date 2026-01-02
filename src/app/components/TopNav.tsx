"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/myOrders", label: "My Orders" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
      aria-label="Top navigation"
    >
      {links.map(l => {
        const active = pathname === l.href;

        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
