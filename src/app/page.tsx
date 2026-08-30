import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/button-styles";

const features = [
  {
    icon: "💸",
    title: "Ingresos y gastos",
    text: "Registra cada movimiento en segundos, con categorías y etiquetas a tu medida.",
  },
  {
    icon: "📊",
    title: "Panorama claro",
    text: "Un resumen mensual con gráficos que muestran en qué se te va la plata.",
  },
  {
    icon: "💳",
    title: "Deudas bajo control",
    text: "Lleva el saldo pendiente de cada deuda y registra tus abonos.",
  },
  {
    icon: "🎯",
    title: "Metas de ahorro",
    text: "Ponte objetivos y mira tu progreso crecer con cada aporte.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-12 py-8">
        <div className="space-y-3 text-center">
          <span className="text-4xl">🐷</span>
          <h1 className="text-3xl font-semibold">Walley</h1>
          <p className="text-ink-secondary">
            Tu plata, tus deudas y tus metas de ahorro en un solo lugar —
            simple, claro y sin hojas de cálculo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/register" className={buttonClasses.primary}>
            Crear cuenta gratis
          </Link>
          <Link href="/login" className={buttonClasses.secondary}>
            Ya tengo cuenta
          </Link>
        </div>

        <ul className="space-y-4">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-sm text-ink-secondary">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
