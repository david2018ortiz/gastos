"use client";

import { useActionState, useState } from "react";
import { renameAccount, deleteAccount } from "./actions";
import type { AccountActionState } from "./actions";
import { buttonClasses } from "@/components/button-styles";

const initialState: AccountActionState = { error: null };

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function AccountItem({
  id,
  name,
  icon,
  balance,
  household,
}: {
  id: string;
  name: string;
  icon: string | null;
  balance: number;
  household: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [state, formAction, pending] = useActionState(renameAccount, initialState);

  if (editing) {
    return (
      <li className="rounded-lg border p-3">
        <form action={formAction} className="space-y-1.5">
          <input type="hidden" name="id" value={id} />
          <div className="flex gap-2">
            <input
              name="icon"
              defaultValue={icon ?? ""}
              maxLength={2}
              className="w-14 rounded-xl border px-2 py-2 text-center"
            />
            <input
              name="name"
              defaultValue={name}
              required
              autoFocus
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
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
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">
          {icon ?? "💳"} {name}
          {household && (
            <span className="ml-1 text-xs" title="Cuenta compartida con tu familia">
              🏠
            </span>
          )}
        </p>
        <p className="text-xs text-ink-muted tabular-nums">
          {currencyFormatter.format(balance)}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {confirmingDelete ? (
          <form action={deleteAccount} className="flex items-center gap-2">
            <input type="hidden" name="id" value={id} />
            <span className="text-negative">¿Eliminar?</span>
            <button type="submit" className="text-negative underline">
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-ink-secondary underline"
            >
              No
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="underline"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-negative underline"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
