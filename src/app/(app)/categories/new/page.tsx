import Link from "next/link";
import { CategoryForm } from "../category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nueva categoría</h1>
          <Link href="/categories" className="text-sm underline">
            Volver
          </Link>
        </div>

        <CategoryForm action={createCategory} submitLabel="Crear categoría" />
      </div>
    </main>
  );
}
