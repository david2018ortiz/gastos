"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CategoryActionState = { error: string | null };

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const color = String(formData.get("color") ?? "").trim() || null;
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name, type, color, icon, household_id: householdId });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Ya tienes una categoría con ese nombre y tipo."
        : "No se pudo crear la categoría.",
    };
  }

  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const color = String(formData.get("color") ?? "").trim() || null;
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const householdId = String(formData.get("householdId") ?? "") || null;

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }
  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }

  const { error } = await supabase
    .from("categories")
    .update({ name, type, color, icon, household_id: householdId })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505"
        ? "Ya tienes una categoría con ese nombre y tipo."
        : "No se pudo guardar la categoría.",
    };
  }

  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/categories");
}
