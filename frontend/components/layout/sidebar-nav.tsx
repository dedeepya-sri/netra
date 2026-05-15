"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { isActivePath, navItems } from "@/components/layout/nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            className={`block rounded-md px-3 py-2 text-sm transition ${
              active
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const selectedPath = navItems.some((item) => isActivePath(pathname, item.href))
    ? navItems.find((item) => isActivePath(pathname, item.href))?.href
    : "/";

  return (
    <select
      className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
      onChange={(event) => {
        router.push(event.target.value);
      }}
      value={selectedPath}
    >
      {navItems.map((item) => (
        <option key={item.href} value={item.href}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
