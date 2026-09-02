"use client";

import { useState } from "react";

// Formatea en vivo como pesos colombianos: "." como separador de miles,
// "," como separador decimal (ej. 1.234.567,50). El valor que viaja al
// formulario (input oculto) siempre usa "." como separador decimal para
// que Number() lo interprete bien en el server action.
function formatIntegerPart(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("es-CO").format(BigInt(digits));
}

function splitRaw(raw: string): { integer: string; decimal: string | null } {
  const [integer, decimal] = raw.split(",");
  return { integer: integer ?? "", decimal: decimal ?? null };
}

export function CurrencyInput({
  id,
  name,
  required,
  defaultValue,
  className,
  value,
  onValueChange,
}: {
  id?: string;
  name: string;
  required?: boolean;
  defaultValue?: number | string | null;
  className?: string;
  /** Modo controlado (ej. para prellenar desde la entrada por voz). Dígitos crudos, coma como decimal. */
  value?: string;
  onValueChange?: (raw: string) => void;
}) {
  const initial =
    defaultValue !== undefined && defaultValue !== null && defaultValue !== ""
      ? String(defaultValue).replace(".", ",")
      : "";
  const [internalRaw, setInternalRaw] = useState(initial);
  const raw = value !== undefined ? value : internalRaw;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let next = e.target.value.replace(/[^\d,]/g, "");
    const firstComma = next.indexOf(",");
    if (firstComma !== -1) {
      next =
        next.slice(0, firstComma + 1) +
        next.slice(firstComma + 1).replace(/,/g, "").slice(0, 2);
    }
    if (onValueChange) {
      onValueChange(next);
    } else {
      setInternalRaw(next);
    }
  }

  const { integer, decimal } = splitRaw(raw);
  const display =
    formatIntegerPart(integer) + (decimal !== null ? "," + decimal : "");
  const hiddenValue = integer + (decimal !== null ? "." + decimal : "");

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      >
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        required={required}
        placeholder="0"
        value={display}
        onChange={handleChange}
        className={
          className ??
          "w-full rounded-xl border py-2 pl-7 pr-3 tabular-nums"
        }
      />
      <input type="hidden" name={name} value={hiddenValue} />
    </div>
  );
}
