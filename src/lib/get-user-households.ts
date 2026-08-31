import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

export type HouseholdOption = { id: string; name: string };

/**
 * Espacios compartidos a los que pertenece el usuario, para ofrecerlos como
 * opción "Personal / Familia X" al crear transacciones, deudas o metas.
 */
export async function getUserHouseholds(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<HouseholdOption[]> {
  const { data: memberships } = await supabase
    .from("household_members")
    .select("households(id, name)")
    .eq("user_id", userId);

  return (memberships ?? [])
    .map((m) => m.households)
    .filter((h): h is HouseholdOption => Boolean(h));
}
