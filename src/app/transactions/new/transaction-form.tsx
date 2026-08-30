"use client";

import { useActionState } from "react";
import {
  createTransaction,
  transactionActionInitialState,
} from "../actions";
import type { Tables } from "@/lib/supabase/database.types";

export function TransactionForm({
  categories,
}: {
  categories: Tables<"categories">[];
}) {
  const [state, formAction, pending] = useActionState(
    createTransaction,
    transactionActionInitialState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <span className="text-sm font-medium">Tipo</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="expense" defaultChecked />
            Gasto
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="income" />
            Ingreso
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="amount" className="text-sm font-medium">
          Monto
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="occurredAt" className="text-sm font-medium">
          Fecha
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="date"
          defaultValue={today}
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
          className="w-full rounded-md border px-3 py-2"
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
        {pending ? "Guardando…" : "Guardar transacción"}
      </button>
    </form>
  );
}
