"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";

import { useActionState } from "react";
import type { DebtActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";

const initialState: DebtActionState = { error: null };

export function DebtForm({
  action,
  debt,
  households = [],
  submitLabel,
}: {
  action: (
    state: DebtActionState,
    formData: FormData,
  ) => Promise<DebtActionState>;
  debt?: Tables<"debts">;
  households?: HouseholdOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {debt && <input type="hidden" name="id" value={debt.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={debt?.name ?? ""}
          placeholder="ej. Tarjeta de crédito"
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      {!debt && (
        <div className="space-y-1">
          <label htmlFor="totalAmount" className="text-sm font-medium">
            Monto total
          </label>
          <CurrencyInput id="totalAmount" name="totalAmount" required />
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Fecha límite (opcional)
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={debt?.due_date ?? ""}
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      <HouseholdSelect households={households} defaultValue={debt?.household_id} />

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
