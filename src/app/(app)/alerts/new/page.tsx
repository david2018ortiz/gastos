import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "./alert-form";

export default async function NewAlertPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categories }, { data: debts }, { data: goals }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("type", "expense").order("name"),
    supabase.from("debts").select("id, name").order("name"),
    supabase.from("savings_goals").select("id, name").order("name"),
  ]);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nueva alerta</h1>
          <Link href="/alerts" className="text-sm underline">
            Volver
          </Link>
        </div>

        <AlertForm
          categories={categories ?? []}
          debts={debts ?? []}
          savingsGoals={goals ?? []}
        />
      </div>
    </main>
  );
}
