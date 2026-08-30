"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Resumen", icon: "🏠" },
  { href: "/transactions", label: "Movimientos", icon: "💸" },
  { href: "/debts", label: "Deudas", icon: "💳" },
  { href: "/savings", label: "Ahorro", icon: "🎯" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-sm items-stretch justify-between px-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors " +
                  (active ? "text-brand-strong" : "text-ink-muted hover:text-ink-secondary")
                }
                aria-current={active ? "page" : undefined}
              >
                <span className="text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
