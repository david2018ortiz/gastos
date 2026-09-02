"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePassword } from "@/app/(app)/profile/actions";
import type { ProfileActionState } from "@/app/(app)/profile/actions";
import { buttonClasses } from "@/components/button-styles";

const initialState: ProfileActionState = { error: null, success: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  if (state.success) {
    return (
      <div className="space-y-4 feedback-enter">
        <p className="text-sm text-positive">
          Contraseña actualizada. Ya puedes seguir usando Walley.
        </p>
        <Link href="/dashboard" className={buttonClasses.primary}>
          Ir al resumen
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClasses.primary}>
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
