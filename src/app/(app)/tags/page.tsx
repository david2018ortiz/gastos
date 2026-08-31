import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserHouseholds } from "@/lib/get-user-households";
import { deleteTag } from "./actions";
import { TagForm } from "./tag-form";
import { PageTitleBar } from "@/components/page-title-bar";

export default async function TagsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: tags }, households] = await Promise.all([
    supabase.from("tags").select("*").order("name"),
    getUserHouseholds(supabase, user.id),
  ]);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <PageTitleBar title="Etiquetas" />

        <TagForm households={households} />

        {!tags || tags.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no tienes etiquetas.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              >
                {tag.name}
                {tag.household_id && (
                  <span className="text-xs" title="Etiqueta compartida con tu familia">
                    🏠
                  </span>
                )}
                <form action={deleteTag}>
                  <input type="hidden" name="id" value={tag.id} />
                  <button
                    type="submit"
                    aria-label={`Eliminar etiqueta ${tag.name}`}
                    className="text-ink-muted hover:text-negative"
                  >
                    ×
                  </button>
                </form>
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
