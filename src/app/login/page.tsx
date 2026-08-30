"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/app/auth/actions";
import { AppleSignInButton } from "./apple-sign-in-button";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

        <form action={formAction} className="space-y-4">
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
              autoComplete="current-password"
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
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <div className="h-px flex-1 bg-neutral-200" />
          o
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <AppleSignInButton />

        <p className="text-sm text-center text-neutral-600">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
