"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState } from "react";
import type { CategoryActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";
import { IconPicker } from "./icon-picker";

const initialState: CategoryActionState = { error: null };

const COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#84CC16",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

export function CategoryForm({
  action,
  category,
  submitLabel,
}: {
  action: (
    state: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  category?: Tables<"categories">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Tipo</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="expense"
              defaultChecked={!category || category.type === "expense"}
            />
            Gasto
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="income"
              defaultChecked={category?.type === "income"}
            />
            Ingreso
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Color</span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={category?.color === color}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 ring-black"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-sm font-medium">Ícono</span>
        <IconPicker defaultValue={category?.icon} />
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
