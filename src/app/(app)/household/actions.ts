"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type HouseholdActionState = { error: string | null };

export async function createHousehold(
  _prevState: HouseholdActionState,
  formData: FormData,
): Promise<HouseholdActionState> {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Ponle un nombre al espacio (ej. \"Familia Ortiz\")." };
  }

  const { error } = await supabase.rpc("create_household", { p_name: name });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/household");
  return { error: null };
}

export async function inviteToHousehold(
  _prevState: HouseholdActionState,
  formData: FormData,
): Promise<HouseholdActionState> {
  const supabase = await createClient();
  const householdId = String(formData.get("householdId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Escribe el correo de la persona a invitar." };
  }

  const { error } = await supabase.rpc("invite_to_household", {
    p_household_id: householdId,
    p_email: email,
  });

  if (error) {
    // Mensajes de la función SQL (usuario no existe, ya es miembro, etc.)
    // ya vienen en español y listos para mostrar.
    return { error: error.message };
  }

  revalidatePath("/household");
  return { error: null };
}

export async function acceptInvitation(formData: FormData) {
  const supabase = await createClient();
  const invitationId = String(formData.get("invitationId") ?? "");
  await supabase.rpc("accept_household_invitation", {
    p_invitation_id: invitationId,
  });
  revalidatePath("/household");
}

export async function declineInvitation(formData: FormData) {
  const supabase = await createClient();
  const invitationId = String(formData.get("invitationId") ?? "");
  await supabase.rpc("decline_household_invitation", {
    p_invitation_id: invitationId,
  });
  revalidatePath("/household");
}

export async function leaveHousehold(formData: FormData) {
  const supabase = await createClient();
  const householdId = String(formData.get("householdId") ?? "");
  await supabase.rpc("leave_household", { p_household_id: householdId });
  revalidatePath("/household");
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();
  const householdId = String(formData.get("householdId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  await supabase.rpc("remove_household_member", {
    p_household_id: householdId,
    p_user_id: userId,
  });
  revalidatePath("/household");
}
