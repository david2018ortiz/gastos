import type { HouseholdOption } from "@/lib/get-user-households";

/**
 * Deja elegir si lo que se está registrando es personal o de un espacio
 * compartido (familia). Si el usuario no pertenece a ningún household, no
 * se renderiza nada (queda personal por defecto, sin ruido en el formulario).
 */
export function HouseholdSelect({
  households,
  defaultValue = "",
}: {
  households: HouseholdOption[];
  defaultValue?: string | null;
}) {
  if (households.length === 0) return null;

  return (
    <div className="space-y-1">
      <label htmlFor="householdId" className="text-sm font-medium">
        Pertenece a
      </label>
      <select
        id="householdId"
        name="householdId"
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border px-3 py-2"
      >
        <option value="">Solo yo (personal)</option>
        {households.map((h) => (
          <option key={h.id} value={h.id}>
            🏠 {h.name}
          </option>
        ))}
      </select>
    </div>
  );
}
