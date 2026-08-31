"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const WATCHED_TABLES = [
  "transactions",
  "savings_goals",
  "savings_contributions",
  "debts",
  "debt_payments",
  "household_invitations",
  "household_members",
  "categories",
  "tags",
  "transaction_tags",
] as const;

const WATCHED_EVENTS = ["INSERT", "UPDATE", "DELETE"] as const;

export function RealtimeRefresher({ userId }: { userId: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => router.refresh(), 400);
    }

    function subscribe() {
      let channel = supabase.channel(`app-changes-${userId}-${Date.now()}`);
      for (const table of WATCHED_TABLES) {
        for (const event of WATCHED_EVENTS) {
          channel = channel.on(
            "postgres_changes",
            { event, schema: "public", table },
            scheduleRefresh,
          );
        }
      }
      // Si el socket se cae (red inestable, el celular vuelve de segundo
      // plano, etc.), Realtime deja de avisar en silencio: hay que
      // reabrir el canal manualmente y refrescar por si algo se perdió.
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          supabase.removeChannel(channel);
          setTimeout(() => {
            channelRef.current = subscribe();
          }, 1000);
        }
      });
      return channel;
    }

    const channelRef = { current: subscribe() };

    function onVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channelRef.current);
    };
  }, [userId, router]);

  return null;
}
