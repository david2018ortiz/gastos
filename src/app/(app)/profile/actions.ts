"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error: string | null; success: boolean };

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión.", success: false };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? Number(ageRaw) : null;

  if (age !== null && (Number.isNaN(age) || age < 0 || age > 120)) {
    return { error: "Edad inválida.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone: phone || null, age })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar el perfil.", success: false };
  }

  revalidatePath("/profile");
  return { error: null, success: true };
}

export async function changePassword(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo cambiar la contraseña.", success: false };
  }

  return { error: null, success: true };
}
