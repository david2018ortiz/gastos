import type { AccountOption } from "@/lib/get-user-accounts";

/**
 * Deja elegir de qué cuenta/fondo sale o entra el dinero (Davivienda,
 * Nequi, etc.). Si el usuario no tiene cuentas creadas, no se renderiza
 * nada (sin ruido en el formulario).
 */
export function AccountSelect({
  accounts,
  defaultValue = "",
  label = "Cuenta",
}: {
  accounts: AccountOption[];
  defaultValue?: string | null;
  label?: string;
}) {
  if (accounts.length === 0) return null;

  return (
    <div className="space-y-1">
      <label htmlFor="accountId" className="text-sm font-medium">
        {label}
      </label>
      <select
        id="accountId"
        name="accountId"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border px-3 py-2"
      >
        <option value="">Sin cuenta</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.icon ?? "💳"} {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
