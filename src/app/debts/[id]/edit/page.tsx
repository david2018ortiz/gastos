import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DebtForm } from "../../debt-form";
import { updateDebt } from "../../actions";

export default async function EditDebtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: debt } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .single();

  if (!debt) {
    notFound();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Editar deuda</h1>
          <Link href="/debts" className="text-sm underline">
            Volver
          </Link>
        </div>

        <DebtForm action={updateDebt} debt={debt} submitLabel="Guardar cambios" />
      </div>
    </main>
  );
}
