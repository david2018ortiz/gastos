"use client";

import { useActionState, useState } from "react";
import { renameAccount, deleteAccount } from "./actions";
import type { AccountActionState } from "./actions";
import { buttonClasses } from "@/components/button-styles";
import { AccountIcon, type AccountIconType } from "@/components/account-icon";

const initialState: AccountActionState = { error: null };

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const TYPES: { value: AccountIconType; label: string }[] = [
  { value: "bank", label: "Banco" },
  { value: "wallet", label: "Billetera" },
  { value: "card", label: "Tarjeta" },
];

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

export function AccountItem({
  id,
  name,
  iconType,
  color,
  balance,
  household,
}: {
  id: string;
  name: string;
  iconType: string;
  color: string;
  balance: number;
  household: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draftType, setDraftType] = useState<AccountIconType>(
    (iconType as AccountIconType) ?? "bank",
  );
  const [draftColor, setDraftColor] = useState(color);
  const [state, formAction, pending] = useActionState(renameAccount, initialState);

  if (editing) {
    return (
      <li className="rounded-lg border p-3">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="iconType" value={draftType} />
          <input type="hidden" name="color" value={draftColor} />

          <input
            name="name"
            defaultValue={name}
            required
            autoFocus
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setDraftType(t.value)}
                aria-pressed={draftType === t.value}
                className={
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-xs " +
                  (draftType === t.value
                    ? "border-brand bg-brand-soft text-ink"
                    : "border-border text-ink-secondary")
                }
              >
                <AccountIcon type={t.value} color={draftColor} size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDraftColor(c)}
                aria-label={`Color ${c}`}
                aria-pressed={draftColor === c}
                className="h-7 w-7 rounded-full transition-transform active:scale-90"
                style={{
                  backgroundColor: c,
                  boxShadow: draftColor === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined,
                }}
              />
            ))}
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
      <div className="flex items-center gap-2.5">
        <AccountIcon type={iconType} color={color} />
        <div>
          <p className="text-sm font-medium">
            {name}
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
              className="text-xs text-ink-secondary underline"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-xs text-ink-secondary underline"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
