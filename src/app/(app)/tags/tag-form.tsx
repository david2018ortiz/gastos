"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState, useRef, useEffect } from "react";
import { createTag } from "./actions";
import type { TagActionState } from "./actions";

const initialState: TagActionState = { error: null };

export function TagForm() {
  const [state, formAction, pending] = useActionState(createTag, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input
        name="name"
        type="text"
        required
        placeholder="Nueva etiqueta"
        className="flex-1 rounded-md border px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses.primaryInline}
      >
        {pending ? "…" : "Agregar"}
      </button>
      {state.error && (
        <p className="text-sm text-negative basis-full feedback-enter" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
