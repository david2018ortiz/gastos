"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteToHousehold } from "./actions";
import type { HouseholdActionState } from "./actions";
import { buttonClasses } from "@/components/button-styles";

const initialState: HouseholdActionState = { error: null };

export function InviteForm({ householdId }: { householdId: string }) {
  const [state, formAction, pending] = useActionState(
    inviteToHousehold,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="householdId" value={householdId} />
      <div className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="correo@ejemplo.com"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses.primaryInline}
        >
          {pending ? "…" : "Invitar"}
        </button>
      </div>
      <p className="text-xs text-ink-muted">
        Solo funciona si esa persona ya tiene cuenta en Walley con ese correo
        — no enviamos ningún email, le aparecerá la invitación dentro de la app.
      </p>
      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
