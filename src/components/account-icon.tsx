export type AccountIconType = "bank" | "wallet" | "card";

/**
 * Ícono genérico por tipo de cuenta, coloreado con el tono de marca que
 * el usuario elige (rojo Davivienda, morado Nequi, etc.) — a propósito
 * NO reproduce el logo real de ningún banco/billetera, esas son marcas
 * registradas. El color por sí solo no tiene ese problema.
 */
export function AccountIcon({
  type,
  color,
  size = 20,
}: {
  type: AccountIconType | string;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size * 1.7, height: size * 1.7, backgroundColor: color + "22" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {type === "wallet" ? (
          <>
            <rect x="3" y="6" width="18" height="13" rx="3" stroke={color} strokeWidth="1.8" />
            <path d="M3 10h18" stroke={color} strokeWidth="1.8" />
            <circle cx="16.5" cy="14.2" r="1.3" fill={color} />
          </>
        ) : type === "card" ? (
          <>
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke={color} strokeWidth="1.8" />
            <path d="M2.5 9.5h19" stroke={color} strokeWidth="1.8" />
            <path d="M6 14.5h5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M3 9.5 12 4l9 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.5 9.5v9M9 9.5v9M15 9.5v9M19.5 9.5v9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M2.5 19.5h19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}
