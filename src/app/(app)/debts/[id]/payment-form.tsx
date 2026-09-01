"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";

import { useActionState } from "react";
import { addDebtPayment } from "../actions";
import type { PaymentActionState } from "../actions";
import { AccountSelect } from "@/components/account-select";
import type { AccountOption } from "@/lib/get-user-accounts";

const initialState: PaymentActionState = { error: null };

export function PaymentForm({
  debtId,
  accounts = [],
}: {
  debtId: string;
  accounts?: AccountOption[];
}) {
  const [state, formAction, pending] = useActionState(
    addDebtPayment,
    initialState,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="debtId" value={debtId} />

      <div className="flex gap-2">
        <div className="flex-1">
          <CurrencyInput name="amount" required />
        </div>
        <input
          name="paidAt"
          type="date"
          defaultValue={today}
          className="rounded-md border px-3 py-2"
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
        {pending ? "Registrando…" : "Registrar abono"}
      </button>
    </form>
  );
}
