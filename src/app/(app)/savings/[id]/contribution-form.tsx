"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";

import { useActionState } from "react";
import { addSavingsContribution } from "../actions";
import type { ContributionActionState } from "../actions";

const initialState: ContributionActionState = { error: null };

export function ContributionForm({ goalId }: { goalId: string }) {
  const [state, formAction, pending] = useActionState(
    addSavingsContribution,
    initialState,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="savingsGoalId" value={goalId} />

      <div className="flex gap-2">
        <div className="flex-1">
          <CurrencyInput name="amount" required />
        </div>
        <input
          name="contributedAt"
          type="date"
          defaultValue={today}
          className="rounded-md border px-3 py-2"
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
        {pending ? "Registrando…" : "Registrar aporte"}
      </button>
    </form>
  );
}
