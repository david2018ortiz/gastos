// Clases compartidas para botones y enlaces de acción. Centralizadas aquí
// para que la paleta/tamaño de toque cambien en un solo lugar (Fase 10).
//
// Jerarquía deliberada (no todos los botones deben pesar lo mismo — un
// solo verde sólido repetido en cada pantalla se lee genérico/plano):
// - `primary`: LA acción que confirma la pantalla (Guardar, Crear). Es el
//   único botón sólido y sombreado que debería haber a la vez.
// - `primaryInline`: acciones secundarias frecuentes (Nueva, Agregar).
//   Relleno suave (bg-brand-soft), sin sombra, más chico — no compite
//   visualmente con el primario.
// - `secondary`: acción alternativa neutra, solo borde.
// - `danger` / `ghost`: acciones de texto, sin caja, para filas de listas.
const base =
  "inline-flex items-center justify-center gap-1.5 font-medium " +
  "transition-all duration-150 active:scale-[0.96] disabled:opacity-50 " +
  "disabled:active:scale-100";

export const buttonClasses = {
  primary: `${base} rounded-2xl bg-brand text-brand-ink px-5 py-2 min-h-11 shadow-sm hover:bg-brand-strong w-full`,
  primaryInline: `${base} rounded-xl bg-brand-soft text-ink px-3.5 py-1.5 min-h-9 text-sm hover:bg-brand/25`,
  secondary: `${base} rounded-2xl border border-border-strong text-ink px-5 py-2 min-h-11 hover:bg-surface-raised`,
  danger: `${base} rounded-lg text-negative px-2.5 py-1.5 text-sm min-h-9 hover:bg-negative/10`,
  ghost: `${base} rounded-lg text-ink-secondary px-2.5 py-1.5 text-sm min-h-9 hover:bg-surface-raised`,
};

export const linkClasses =
  "inline-flex min-h-9 items-center text-sm text-ink-secondary underline underline-offset-2 " +
  "transition-opacity hover:opacity-70";
