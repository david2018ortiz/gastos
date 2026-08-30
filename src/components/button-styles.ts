// Clases compartidas para botones y enlaces de acción. Centralizadas aquí
// para que la paleta/tamaño de toque cambien en un solo lugar (Fase 10).
const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-medium " +
  "transition-all duration-150 active:scale-[0.97] disabled:opacity-50 " +
  "disabled:active:scale-100 min-h-11";

export const buttonClasses = {
  primary: `${base} bg-brand text-white px-4 py-2 hover:bg-brand-strong w-full`,
  primaryInline: `${base} bg-brand text-white px-4 py-2 hover:bg-brand-strong`,
  secondary: `${base} border border-border-strong text-ink px-4 py-2 hover:bg-surface-raised`,
  danger: `${base} text-negative px-2 py-2 hover:bg-negative/10 min-h-9`,
  ghost: `${base} text-ink-secondary px-2 py-2 hover:bg-surface-raised min-h-9`,
};

export const linkClasses =
  "inline-flex min-h-9 items-center text-sm text-brand underline underline-offset-2 " +
  "transition-opacity hover:opacity-70";
