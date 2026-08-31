import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { DebtForm } from "../debt-form";
import { createDebt } from "../actions";

export default async function NewDebtPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const households = await getUserHouseholds(supabase, user.id);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Nueva deuda</h1>
          <Link href="/debts" className="text-sm underline">
            Volver
          </Link>
        </div>

        <DebtForm action={createDebt} households={households} submitLabel="Crear deuda" />
      </div>
    </main>
  );
}
