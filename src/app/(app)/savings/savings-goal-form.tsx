"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";

import { useActionState } from "react";
import type { SavingsGoalActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";

const initialState: SavingsGoalActionState = { error: null };

export function SavingsGoalForm({
  action,
  goal,
  households = [],
  submitLabel,
}: {
  action: (
    state: SavingsGoalActionState,
    formData: FormData,
  ) => Promise<SavingsGoalActionState>;
  goal?: Tables<"savings_goals">;
  households?: HouseholdOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {goal && <input type="hidden" name="id" value={goal.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={goal?.name ?? ""}
          placeholder="ej. Vacaciones"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {!goal && (
        <div className="space-y-1">
          <label htmlFor="targetAmount" className="text-sm font-medium">
            Meta
          </label>
          <CurrencyInput id="targetAmount" name="targetAmount" required />
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="targetDate" className="text-sm font-medium">
          Plazo (opcional)
        </label>
        <input
          id="targetDate"
          name="targetDate"
          type="date"
          defaultValue={goal?.target_date ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <HouseholdSelect households={households} defaultValue={goal?.household_id} />

      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses.primary}
      >
        {pending ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
