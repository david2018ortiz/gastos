import { Fragment } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTitleBar } from "@/components/page-title-bar";
import { getUserAccounts } from "@/lib/get-user-accounts";

const navLinks = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/accounts", label: "Cuentas" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/categories", label: "Categorías" },
  { href: "/tags", label: "Etiquetas" },
  { href: "/debts", label: "Deudas" },
  { href: "/savings", label: "Ahorro" },
  { href: "/alerts", label: "Alertas" },
  { href: "/household", label: "Familia" },
];

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const NO_ACCOUNT = "__sin_cuenta__";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, accounts, { data: allTransactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getUserAccounts(supabase, user.id),
    supabase.from("transactions").select("account_id, type, amount"),
  ]);

  if (!profile) {
    redirect("/login");
  }

  // Consolidado histórico: ingresos y gastos de siempre, sumados por
  // cuenta (no solo el neto que ya se ve en /accounts).
  const totalsByAccount = new Map<string, { income: number; expense: number }>();
  for (const t of allTransactions ?? []) {
    const key = t.account_id ?? NO_ACCOUNT;
    const entry = totalsByAccount.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "income") entry.income += t.amount;
    else entry.expense += t.amount;
    totalsByAccount.set(key, entry);
  }
  const grandTotal = Array.from(totalsByAccount.values()).reduce(
    (acc, v) => ({ income: acc.income + v.income, expense: acc.expense + v.expense }),
    { income: 0, expense: 0 },
  );
  const unassigned = totalsByAccount.get(NO_ACCOUNT);

  const initial = (profile.full_name?.trim()?.[0] ?? user.email?.[0] ?? "?").toUpperCase();

  return (
    <main className="flex-1 p-5">
      <div className="mx-auto max-w-sm space-y-5">
        <PageTitleBar
          title="Perfil"
          userId={user.id}
          action={
            <>
              <ThemeToggle />
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center text-sm text-ink-secondary underline underline-offset-2"
                >
                  Salir
                </button>
              </form>
            </>
          }
        />

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-semibold text-brand-ink">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {profile.full_name || "Sin nombre"}
            </p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>

        <nav className="grid grid-cols-3 gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-border px-2 py-2 text-center text-xs text-ink transition-colors hover:bg-surface-raised"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <section className="space-y-2 rounded-lg border p-3">
          <h2 className="text-sm font-medium text-ink-secondary">
            Consolidado histórico
          </h2>
          {accounts.length === 0 && !unassigned ? (
            <p className="text-xs text-ink-muted">
              Todavía no hay transacciones registradas.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1.5 text-xs">
                <span className="text-ink-muted">Cuenta</span>
                <span className="text-right text-ink-muted">Ingresos</span>
                <span className="text-right text-ink-muted">Gastos</span>
                {accounts.map((account) => {
                  const totals = totalsByAccount.get(account.id) ?? { income: 0, expense: 0 };
                  return (
                    <Fragment key={account.id}>
                      <span className="truncate">
                        {account.icon ?? "💳"} {account.name}
                      </span>
                      <span className="text-right tabular-nums text-positive">
                        {currencyFormatter.format(totals.income)}
                      </span>
                      <span className="text-right tabular-nums text-negative">
                        {currencyFormatter.format(totals.expense)}
                      </span>
                    </Fragment>
                  );
                })}
                {unassigned && (
                  <>
                    <span className="truncate text-ink-muted">Sin cuenta</span>
                    <span className="text-right tabular-nums text-positive">
                      {currencyFormatter.format(unassigned.income)}
                    </span>
                    <span className="text-right tabular-nums text-negative">
                      {currencyFormatter.format(unassigned.expense)}
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-t border-border pt-1.5 text-xs font-semibold">
                <span>Total</span>
                <span className="text-right tabular-nums text-positive">
                  {currencyFormatter.format(grandTotal.income)}
                </span>
                <span className="text-right tabular-nums text-negative">
                  {currencyFormatter.format(grandTotal.expense)}
                </span>
              </div>
            </>
          )}
        </section>

        <section className="space-y-2 rounded-lg border p-3">
          <h2 className="text-sm font-medium text-ink-secondary">Datos personales</h2>
          <ProfileForm profile={profile} />
        </section>

        <section className="space-y-2 rounded-lg border p-3">
          <h2 className="text-sm font-medium text-ink-secondary">Cambiar contraseña</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  );
}
