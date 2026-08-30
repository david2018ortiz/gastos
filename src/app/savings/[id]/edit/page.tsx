import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavingsGoalForm } from "../../savings-goal-form";
import { updateSavingsGoal } from "../../actions";

export default async function EditSavingsGoalPage({
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

  const { data: goal } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("id", id)
    .single();

  if (!goal) {
    notFound();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Editar meta</h1>
          <Link href="/savings" className="text-sm underline">
            Volver
          </Link>
        </div>

        <SavingsGoalForm
          action={updateSavingsGoal}
          goal={goal}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  );
}
