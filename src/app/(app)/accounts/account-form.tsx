"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { createAccount } from "./actions";
import type { AccountActionState } from "./actions";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";
import { buttonClasses } from "@/components/button-styles";
import { AccountIcon, type AccountIconType } from "@/components/account-icon";

const initialState: AccountActionState = { error: null };

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

export function AccountForm({ households }: { households: HouseholdOption[] }) {
  const [state, formAction, pending] = useActionState(createAccount, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [iconType, setIconType] = useState<AccountIconType>("bank");
  const [color, setColor] = useState(COLORS[6]);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
      setIconType("bank");
      setColor(COLORS[6]);
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-lg border p-3">
      <input type="hidden" name="iconType" value={iconType} />
      <input type="hidden" name="color" value={color} />

      <input
        name="name"
        type="text"
        required
        placeholder="Nombre (ej. Davivienda, Nequi)"
        className="w-full rounded-xl border px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setIconType(t.value)}
            aria-pressed={iconType === t.value}
            className={
              "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-xs " +
              (iconType === t.value
                ? "border-brand bg-brand-soft text-ink"
                : "border-border text-ink-secondary")
            }
          >
            <AccountIcon type={t.value} color={color} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            className="h-7 w-7 rounded-full ring-offset-2 transition-transform active:scale-90"
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined,
            }}
          />
        ))}
      </div>

      <HouseholdSelect households={households} />
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses.primaryInline}
      >
        {pending ? "…" : "Agregar cuenta"}
      </button>
      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
