import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { CategoryForm } from "../../category-form";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: category }, households] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).single(),
    getUserHouseholds(supabase, user.id),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Editar categoría</h1>
          <Link href="/categories" className="text-sm underline">
            Volver
          </Link>
        </div>

        <CategoryForm
          action={updateCategory}
          category={category}
          households={households}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  );
}
