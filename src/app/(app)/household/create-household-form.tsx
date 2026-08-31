"use client";

import { useActionState } from "react";
import { createHousehold } from "./actions";
import type { HouseholdActionState } from "./actions";
import { buttonClasses } from "@/components/button-styles";

const initialState: HouseholdActionState = { error: null };

export function CreateHouseholdForm() {
  const [state, formAction, pending] = useActionState(
    createHousehold,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder="ej. Familia Ortiz"
        className="w-full rounded-md border px-3 py-2"
      />
      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses.primary}>
        {pending ? "Creando…" : "Crear espacio compartido"}
      </button>
    </form>
  );
}
