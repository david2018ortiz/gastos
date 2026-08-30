"use client";

import { buttonClasses } from "@/components/button-styles";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import type { ProfileActionState } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";

const initialState: ProfileActionState = { error: null, success: false };

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={profile.full_name ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm font-medium">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="age" className="text-sm font-medium">
          Edad
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={0}
          max={120}
          defaultValue={profile.age ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-positive feedback-enter" role="status">
          Perfil guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses.primaryInline}
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
