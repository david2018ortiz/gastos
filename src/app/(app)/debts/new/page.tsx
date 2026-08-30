import Link from "next/link";
import { DebtForm } from "../debt-form";
import { createDebt } from "../actions";

export default function NewDebtPage() {
  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nueva deuda</h1>
          <Link href="/debts" className="text-sm underline">
            Volver
          </Link>
        </div>

        <DebtForm action={createDebt} submitLabel="Crear deuda" />
      </div>
    </main>
  );
}
