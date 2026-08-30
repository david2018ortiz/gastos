"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState } from "react";
import type { DebtActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";

const initialState: DebtActionState = { error: null };

export function DebtForm({
  action,
  debt,
  submitLabel,
}: {
  action: (
    state: DebtActionState,
    formData: FormData,
  ) => Promise<DebtActionState>;
  debt?: Tables<"debts">;
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
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {!debt && (
        <div className="space-y-1">
          <label htmlFor="totalAmount" className="text-sm font-medium">
            Monto total
          </label>
          <input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="w-full rounded-md border px-3 py-2"
          />
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
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

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
