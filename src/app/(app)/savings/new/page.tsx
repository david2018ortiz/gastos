import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { SavingsGoalForm } from "../savings-goal-form";
import { createSavingsGoal } from "../actions";

export default async function NewSavingsGoalPage() {
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
          <h1 className="text-lg font-semibold">Nueva meta</h1>
          <Link href="/savings" className="text-sm underline">
            Volver
          </Link>
        </div>

        <SavingsGoalForm
          action={createSavingsGoal}
          households={households}
          submitLabel="Crear meta"
        />
      </div>
    </main>
  );
}
