"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthActionState } from "@/app/auth/actions";
import { AppleSignInButton } from "../login/apple-sign-in-button";

const initialState: AuthActionState = { error: null };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
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

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
          >
            {pending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <div className="h-px flex-1 bg-neutral-200" />
          o
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <AppleSignInButton />

        <p className="text-sm text-center text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
