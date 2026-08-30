import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "../../transaction-form";

export default async function EditTransactionPage({
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

  const [{ data: transaction }, { data: categories }, { data: tagLinks }] =
    await Promise.all([
      supabase.from("transactions").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("transaction_tags")
        .select("tags(name)")
        .eq("transaction_id", id),
    ]);

  if (!transaction) {
    notFound();
  }

  const tagNames = (tagLinks ?? [])
    .map((link) => link.tags?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Editar transacción</h1>
          <Link href="/transactions" className="text-sm underline">
            Volver
          </Link>
        </div>

        <TransactionForm
          categories={categories ?? []}
          transaction={{ ...transaction, tagNames }}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  );
}
