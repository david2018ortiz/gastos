import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlerts } from "@/lib/evaluate-alerts";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const triggeredAlerts = await evaluateAlerts(supabase, user.id);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="text-base font-semibold">
          Walley
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/alerts"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-surface-raised"
            aria-label={
              triggeredAlerts.length > 0
                ? `Alertas: ${triggeredAlerts.length} activa(s)`
                : "Alertas"
            }
          >
            🔔
            {triggeredAlerts.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-negative px-1 text-[10px] font-semibold text-white">
                {triggeredAlerts.length}
              </span>
            )}
          </Link>
          <NavMenu />
        </div>
      </header>

      <PageTransition>{children}</PageTransition>
    </div>
  );
}
