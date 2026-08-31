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

// Sondeo de respaldo: si por lo que sea el WebSocket de Realtime no entrega
// un evento (falla de red, reconexión, etc.), esto garantiza que la
// pantalla igual quede al día en un máximo de ~20s.
const POLL_INTERVAL_MS = 20_000;

export function RealtimeRefresher({ userId }: { userId: string }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => router.refresh(), 400);
    }

    let channel = supabase.channel(`app-changes-${userId}`);
    for (const table of WATCHED_TABLES) {
      for (const event of WATCHED_EVENTS) {
        channel = channel.on(
          "postgres_changes",
          { event, schema: "public", table },
          scheduleRefresh,
        );
      }
    }
    channel.subscribe();

    const pollId = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
