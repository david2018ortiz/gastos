import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Perfil</h1>
          <form action={signOut}>
            <button type="submit" className="text-sm underline">
              Cerrar sesión
            </button>
          </form>
        </div>

        <p className="text-sm text-neutral-500">{user.email}</p>

        <Link href="/dashboard" className="block text-sm underline">
          Ver resumen
        </Link>
        <Link href="/transactions" className="block text-sm underline">
          Ver transacciones
        </Link>
        <Link href="/debts" className="block text-sm underline">
          Ver deudas
        </Link>
        <Link href="/savings" className="block text-sm underline">
          Ver ahorro
        </Link>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Datos personales</h2>
          <ProfileForm profile={profile} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Cambiar contraseña</h2>
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  );
}
