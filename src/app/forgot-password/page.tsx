import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
          <p className="text-sm text-ink-secondary">
            Escribe el email con el que te registraste y te enviamos un
            enlace para poner una contraseña nueva.
          </p>
        </div>

        <ForgotPasswordForm />

        <Link href="/login" className="block text-sm underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
