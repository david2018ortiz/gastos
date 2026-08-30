"use client";

import { useActionState } from "react";
import { changePassword, profileActionInitialState } from "./actions";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    profileActionInitialState,
  );

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
          className="w-full rounded-md border px-3 py-2"
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
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-600" role="status">
          Contraseña actualizada.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black text-white px-4 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Actualizando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
