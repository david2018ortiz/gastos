"use client";

import { useActionState, useState } from "react";
import { renameHousehold, deleteHousehold } from "./actions";
import type { HouseholdActionState } from "./actions";
import { buttonClasses } from "@/components/button-styles";

const initialState: HouseholdActionState = { error: null };

export function HouseholdSettings({
  householdId,
  name,
}: {
  householdId: string;
  name: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [state, formAction, pending] = useActionState(
    renameHousehold,
    initialState,
  );

  if (editing) {
    return (
      <form action={formAction} className="space-y-1.5">
        <input type="hidden" name="householdId" value={householdId} />
        <div className="flex gap-2">
          <input
            name="name"
            defaultValue={name}
            required
            autoFocus
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses.primaryInline}
          >
            {pending ? "…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-ink-secondary underline"
          >
            Cancelar
          </button>
        </div>
        {state.error && (
          <p className="text-sm text-negative feedback-enter" role="alert">
            {state.error}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-ink-secondary underline"
      >
        Renombrar
      </button>
      {confirmingDelete ? (
        <form action={deleteHousehold} className="flex items-center gap-2">
          <input type="hidden" name="householdId" value={householdId} />
          <span className="text-negative">¿Eliminar el espacio?</span>
          <button type="submit" className="text-negative underline">
            Sí, eliminar
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="text-ink-secondary underline"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="text-negative underline"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
