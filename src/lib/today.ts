// El servidor (Vercel) corre en UTC, pero los usuarios están en Colombia
// (UTC-5, sin horario de verano). Usar `new Date()` directamente para
// decidir "qué día es hoy" hace que, entre las 19:00 y medianoche hora
// Colombia, la app ya piense que es el día siguiente (el servidor ya
// cruzó la medianoche en UTC) — filtros de mes/período saltan al mes
// equivocado mientras la etiqueta visual todavía muestra el correcto.
// Esta función calcula "hoy" fijando la zona horaria de Bogotá siempre,
// sin importar en qué timezone corra el servidor o el navegador.
const BOGOTA_TZ = "America/Bogota";

export function todayInBogota(): Date {
  return new Date(todayInBogotaISO() + "T00:00:00");
}

export function todayInBogotaISO(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}
