"use client";

import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";
import { TagPicker, type TagOption } from "@/components/tag-picker";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";
import { AccountSelect } from "@/components/account-select";
import type { AccountOption } from "@/lib/get-user-accounts";

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
  tags = [],
  households = [],
  accounts = [],
  transaction,
  submitLabel = "Guardar transacción",
}: {
  categories: Tables<"categories">[];
  tags?: TagOption[];
  households?: HouseholdOption[];
  accounts?: AccountOption[];
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

      <AccountSelect
        accounts={accounts}
        defaultValue={transaction?.account_id}
        label="¿De qué cuenta sale/entra?"
      />

      <HouseholdSelect
        households={households}
        defaultValue={transaction?.household_id}
      />

      <div className="space-y-1">
        <span className="text-sm font-medium">Etiquetas</span>
        <TagPicker
          availableTags={tags}
          defaultSelected={transaction?.tagNames ?? []}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium">
          Descripción
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="ej. Hamburguesa, mercado del mes…"
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
