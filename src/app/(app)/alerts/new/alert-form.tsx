"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState, useState } from "react";
import { createAlert } from "../actions";
import type { AlertActionState } from "../actions";

const initialState: AlertActionState = { error: null };

type Option = { id: string; name: string };

export function AlertForm({
  categories,
  debts,
  savingsGoals,
}: {
  categories: Option[];
  debts: Option[];
  savingsGoals: Option[];
}) {
  const [state, formAction, pending] = useActionState(createAlert, initialState);
  const [type, setType] = useState<"category_budget" | "debt_due" | "savings_stalled">(
    "category_budget",
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <span className="text-sm font-medium">Tipo de alerta</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="category_budget">Presupuesto de categoría</option>
          <option value="debt_due">Deuda próxima a vencer</option>
          <option value="savings_stalled">Meta de ahorro estancada</option>
        </select>
      </div>

      {type === "category_budget" && (
        <>
          <div className="space-y-1">
            <label htmlFor="categoryId" className="text-sm font-medium">
              Categoría
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              onChange={(e) => {
                const form = e.currentTarget.form!;
                const nameInput = form.elements.namedItem(
                  "categoryName",
                ) as HTMLInputElement;
                nameInput.value = e.currentTarget.selectedOptions[0]?.text ?? "";
              }}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Elige una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="categoryName" />
          </div>
          <div className="space-y-1">
            <label htmlFor="budgetAmount" className="text-sm font-medium">
              Presupuesto mensual
            </label>
            <input
              id="budgetAmount"
              name="budgetAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </>
      )}

      {type === "debt_due" && (
        <>
          <div className="space-y-1">
            <label htmlFor="debtId" className="text-sm font-medium">
              Deuda
            </label>
            <select
              id="debtId"
              name="debtId"
              required
              onChange={(e) => {
                const form = e.currentTarget.form!;
                const nameInput = form.elements.namedItem(
                  "debtName",
                ) as HTMLInputElement;
                nameInput.value = e.currentTarget.selectedOptions[0]?.text ?? "";
              }}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Elige una deuda</option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="debtName" />
          </div>
          <div className="space-y-1">
            <label htmlFor="daysBefore" className="text-sm font-medium">
              Avisar con cuántos días de anticipación
            </label>
            <input
              id="daysBefore"
              name="daysBefore"
              type="number"
              min="0"
              step="1"
              defaultValue={7}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </>
      )}

      {type === "savings_stalled" && (
        <>
          <div className="space-y-1">
            <label htmlFor="savingsGoalId" className="text-sm font-medium">
              Meta de ahorro
            </label>
            <select
              id="savingsGoalId"
              name="savingsGoalId"
              required
              onChange={(e) => {
                const form = e.currentTarget.form!;
                const nameInput = form.elements.namedItem(
                  "savingsGoalName",
                ) as HTMLInputElement;
                nameInput.value = e.currentTarget.selectedOptions[0]?.text ?? "";
              }}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Elige una meta</option>
              {savingsGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <input type="hidden" name="savingsGoalName" />
          </div>
          <div className="space-y-1">
            <label htmlFor="daysWithoutContribution" className="text-sm font-medium">
              Días sin aportes para avisar
            </label>
            <input
              id="daysWithoutContribution"
              name="daysWithoutContribution"
              type="number"
              min="1"
              step="1"
              defaultValue={30}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </>
      )}

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
        {pending ? "Guardando…" : "Crear alerta"}
      </button>
    </form>
  );
}
