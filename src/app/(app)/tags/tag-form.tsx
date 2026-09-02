"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState, useRef, useEffect } from "react";
import { createTag } from "./actions";
import type { TagActionState } from "./actions";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";

const initialState: TagActionState = { error: null };

export function TagForm({ households }: { households: HouseholdOption[] }) {
  const [state, formAction, pending] = useActionState(createTag, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          required
          placeholder="Nueva etiqueta"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses.primaryInline}
        >
          {pending ? "…" : "Agregar"}
        </button>
      </div>
      <HouseholdSelect households={households} />
      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
