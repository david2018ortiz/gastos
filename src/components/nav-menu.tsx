"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/accounts", label: "Cuentas" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/statistics", label: "Estadísticas" },
  { href: "/categories", label: "Categorías" },
  { href: "/tags", label: "Etiquetas" },
  { href: "/debts", label: "Deudas" },
  { href: "/savings", label: "Ahorro" },
  { href: "/alerts", label: "Alertas" },
  { href: "/household", label: "Familia" },
  { href: "/profile", label: "Perfil" },
];

export function NavMenu({ pendingInvitations = 0 }: { pendingInvitations?: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-lg hover:bg-surface-raised"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        ☰
        {pendingInvitations > 0 && (
          <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-negative px-1 text-[9px] font-semibold text-white">
            {pendingInvitations}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul className="absolute right-0 top-9 z-40 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-lg feedback-enter">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      "flex min-h-11 items-center justify-between px-4 py-2.5 text-sm transition-colors " +
                      (active
                        ? "bg-brand-soft font-medium text-ink"
                        : "text-ink-secondary hover:bg-surface-raised")
                    }
                  >
                    {link.label}
                    {link.href === "/household" && pendingInvitations > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-negative px-1 text-[9px] font-semibold text-white">
                        {pendingInvitations}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
