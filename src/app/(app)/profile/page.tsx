import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageTitleBar } from "@/components/page-title-bar";

const navLinks = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/categories", label: "Categorías" },
  { href: "/tags", label: "Etiquetas" },
  { href: "/debts", label: "Deudas" },
  { href: "/savings", label: "Ahorro" },
  { href: "/alerts", label: "Alertas" },
  { href: "/household", label: "Familia" },
];

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
        <PageTitleBar
          title="Perfil"
          action={
            <>
              <ThemeToggle />
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center text-sm text-ink-secondary underline underline-offset-2"
                >
                  Salir
                </button>
              </form>
            </>
          }
        />

        <p className="text-sm text-ink-muted">{user.email}</p>

        <nav className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-border p-3 text-sm text-ink transition-colors hover:bg-surface-raised"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
