import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { CategoryForm } from "../category-form";
import { createCategory } from "../actions";

export default async function NewCategoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const households = await getUserHouseholds(supabase, user.id);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nueva categoría</h1>
          <Link href="/categories" className="text-sm underline">
            Volver
          </Link>
        </div>

        <CategoryForm
          action={createCategory}
          households={households}
          submitLabel="Crear categoría"
        />
      </div>
    </main>
  );
}
