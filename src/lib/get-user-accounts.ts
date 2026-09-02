import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

export type AccountOption = {
  id: string;
  name: string;
  icon: string | null;
  icon_type: string;
  color: string;
};

export async function getUserAccounts(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AccountOption[]> {
  const { data } = await supabase
    .from("accounts")
    .select("id, name, icon, icon_type, color")
    .order("name");

  return data ?? [];
}
