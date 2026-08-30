import Link from "next/link";
import { SavingsGoalForm } from "../savings-goal-form";
import { createSavingsGoal } from "../actions";

export default function NewSavingsGoalPage() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nueva meta</h1>
          <Link href="/savings" className="text-sm underline">
            Volver
          </Link>
        </div>

        <SavingsGoalForm action={createSavingsGoal} submitLabel="Crear meta" />
      </div>
    </main>
  );
}
