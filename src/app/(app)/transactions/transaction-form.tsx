"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";

import { useActionState } from "react";
import { createTransaction, updateTransaction } from "./actions";
import type { TransactionActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";

type TransactionWithTags = Tables<"transactions"> & {
  tagNames?: string[];
};

const initialState: TransactionActionState = { error: null };

export function TransactionForm({
  categories,
  transaction,
  submitLabel = "Guardar transacción",
}: {
  categories: Tables<"categories">[];
  transaction?: TransactionWithTags;
  submitLabel?: string;
}) {
  const action = transaction ? updateTransaction : createTransaction;
  const [state, formAction, pending] = useActionState<
    TransactionActionState,
    FormData
  >(action, initialState);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <div className="space-y-1">
        <span className="text-sm font-medium">Tipo</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="expense"
              defaultChecked={!transaction || transaction.type === "expense"}
            />
            Gasto
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="income"
              defaultChecked={transaction?.type === "income"}
            />
            Ingreso
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium">
          Monto
        </label>
        <CurrencyInput id="amount" name="amount" required defaultValue={transaction?.amount} />
      </div>

      <div className="space-y-1">
        <label htmlFor="occurredAt" className="text-sm font-medium">
          Fecha
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="date"
          defaultValue={transaction?.occurred_at ?? today}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="categoryId" className="text-sm font-medium">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={transaction?.category_id ?? ""}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="tags" className="text-sm font-medium">
          Etiquetas (separadas por coma)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="ej. comida, trabajo"
          defaultValue={transaction?.tagNames?.join(", ") ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium">
          Nota
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={transaction?.note ?? ""}
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
