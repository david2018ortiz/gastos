"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAccount } from "./actions";
import type { AccountActionState } from "./actions";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";
import { buttonClasses } from "@/components/button-styles";

const initialState: AccountActionState = { error: null };

export function AccountForm({ households }: { households: HouseholdOption[] }) {
  const [state, formAction, pending] = useActionState(createAccount, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2 rounded-lg border p-3">
      <div className="flex gap-2">
        <input
          name="icon"
          type="text"
          placeholder="💳"
          maxLength={2}
          className="w-14 rounded-xl border px-2 py-2 text-center"
        />
        <input
          name="name"
          type="text"
          required
          placeholder="Nombre (ej. Davivienda, Nequi)"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
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
