import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { TransactionForm } from "../transaction-form";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: categories }, { data: tags }, households] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("tags").select("id, name").order("name"),
    getUserHouseholds(supabase, user.id),
  ]);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Nueva transacción</h1>
          <Link href="/transactions" className="text-sm underline">
            Volver
          </Link>
        </div>

        <TransactionForm
          categories={categories ?? []}
          tags={tags ?? []}
          households={households}
        />
      </div>
    </main>
  );
}
