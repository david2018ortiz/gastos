import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { evaluateAlerts } from "@/lib/evaluate-alerts";
import { NavMenu } from "./nav-menu";

export async function PageTitleBar({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const triggeredAlerts = user ? await evaluateAlerts(supabase, user.id) : [];

  return (
    <div className="flex items-center justify-between gap-2">
      <h1 className="min-w-0 truncate text-lg font-semibold">{title}</h1>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        <Link
          href="/alerts"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-base hover:bg-surface-raised"
          aria-label={
            triggeredAlerts.length > 0
              ? `Alertas: ${triggeredAlerts.length} activa(s)`
              : "Alertas"
          }
        >
          🔔
          {triggeredAlerts.length > 0 && (
            <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-negative px-1 text-[9px] font-semibold text-white">
              {triggeredAlerts.length}
            </span>
          )}
        </Link>
        <NavMenu />
      </div>
    </div>
  );
}
