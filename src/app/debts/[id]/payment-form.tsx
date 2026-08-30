"use client";

import { useActionState } from "react";
import { addDebtPayment } from "../actions";
import type { PaymentActionState } from "../actions";

const initialState: PaymentActionState = { error: null };

export function PaymentForm({ debtId }: { debtId: string }) {
  const [state, formAction, pending] = useActionState(
    addDebtPayment,
    initialState,
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="debtId" value={debtId} />

      <div className="flex gap-2">
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Monto del abono"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <input
          name="paidAt"
          type="date"
          defaultValue={today}
          className="rounded-md border px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Registrando…" : "Registrar abono"}
      </button>
    </form>
  );
}
