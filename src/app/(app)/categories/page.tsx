import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "./actions";
import { buttonClasses } from "@/components/button-styles";
import { PageTitleBar } from "@/components/page-title-bar";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name");

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar
          title="Categorías"
          action={
            <Link href="/categories/new" className={buttonClasses.primaryInline}>
              Nueva
            </Link>
          }
        />

        {!categories || categories.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no tienes categorías.
          </p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: category.color ?? "#e5e5e5" }}
                  >
                    {category.icon ?? ""}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {category.name}
                      {category.household_id && (
                        <span className="ml-1 text-xs" title="Categoría compartida con tu familia">
                          🏠
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {category.type === "income" ? "Ingreso" : "Gasto"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="underline"
                  >
                    Editar
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button type="submit" className="text-negative underline">
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link href="/transactions" className="block text-sm underline">
          Volver a transacciones
        </Link>
      </div>
    </main>
  );
}
