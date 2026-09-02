"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState } from "react";
import { changePassword } from "./actions";
import type { ProfileActionState } from "./actions";

const initialState: ProfileActionState = { error: null, success: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-ink-secondary">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-xs font-medium text-ink-secondary">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-1.5 text-sm"
        />
      </div>

      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-positive feedback-enter" role="status">
          Contraseña actualizada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses.primaryInline}
      >
        {pending ? "Actualizando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
