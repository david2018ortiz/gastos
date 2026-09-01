import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { AccountForm } from "./account-form";
import { AccountItem } from "./account-item";
import { PageTitleBar } from "@/components/page-title-bar";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: accounts }, { data: transactions }, households] = await Promise.all([
    supabase.from("accounts").select("*").order("name"),
    supabase.from("transactions").select("account_id, type, amount").not("account_id", "is", null),
    getUserHouseholds(supabase, user.id),
  ]);

  const balanceByAccount = new Map<string, number>();
  for (const t of transactions ?? []) {
    if (!t.account_id) continue;
    const delta = t.type === "income" ? t.amount : -t.amount;
    balanceByAccount.set(t.account_id, (balanceByAccount.get(t.account_id) ?? 0) + delta);
  }

  const total = Array.from(balanceByAccount.values()).reduce((sum, v) => sum + v, 0);

  return (
    <main className="flex-1 p-5">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar title="Cuentas" />

        <div className="text-center">
          <p className="text-xs text-ink-muted">Total consolidado</p>
          <p className="text-2xl font-semibold tabular-nums text-ink">
            {currencyFormatter.format(total)}
          </p>
        </div>

        {!accounts || accounts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no tienes cuentas. Crea una (banco, billetera, efectivo…)
            para saber de dónde sale o entra cada peso.
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                id={account.id}
                name={account.name}
                icon={account.icon}
                balance={balanceByAccount.get(account.id) ?? 0}
                household={Boolean(account.household_id)}
              />
            ))}
          </ul>
        )}

        <AccountForm households={households} />

        <Link href="/dashboard" className="block text-sm underline">
          Volver al resumen
        </Link>
      </div>
    </main>
  );
}
