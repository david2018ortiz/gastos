"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";

import { useActionState } from "react";
import { addSavingsContribution } from "../actions";
import type { ContributionActionState } from "../actions";
import { AccountSelect } from "@/components/account-select";
import type { AccountOption } from "@/lib/get-user-accounts";
import { todayInBogotaISO } from "@/lib/today";

const initialState: ContributionActionState = { error: null };

export function ContributionForm({
  goalId,
  accounts = [],
}: {
  goalId: string;
  accounts?: AccountOption[];
}) {
  const [state, formAction, pending] = useActionState(
    addSavingsContribution,
    initialState,
  );
  const today = todayInBogotaISO();

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
          className="rounded-xl border px-3 py-2"
        />
      </div>

      <AccountSelect accounts={accounts} label="¿De qué cuenta sale?" />

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
