"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonClasses } from "@/components/button-styles";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setErrorMessage(null);

    const email = new FormData(e.currentTarget).get("email");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(String(email), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.includes("rate limit")
          ? "Se enviaron demasiados correos en poco tiempo. Espera unos minutos e inténtalo de nuevo."
          : "No se pudo enviar el correo de recuperación.",
      );
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-ink-secondary feedback-enter">
        Si ese correo tiene una cuenta en Walley, te enviamos un enlace para
        restablecer la contraseña. Revisa tu bandeja de entrada (y spam).
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full rounded-xl border px-3 py-2"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-negative feedback-enter" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "pending"}
        className={buttonClasses.primary}
      >
        {status === "pending" ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>
    </form>
  );
}
