// Clases compartidas para botones y enlaces de acción. Centralizadas aquí
// para que la paleta/tamaño de toque cambien en un solo lugar (Fase 10).
// Todo en rounded-full (píldora): es el lenguaje visual de botón nativo de
// app móvil (iOS/Android), a diferencia de los rectángulos rounded-md que
// se leen como controles de escritorio.
const base =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium " +
  "transition-all duration-150 active:scale-[0.97] disabled:opacity-50 " +
  "disabled:active:scale-100 min-h-11";

export const buttonClasses = {
  primary: `${base} bg-brand text-brand-ink px-5 py-2 shadow-sm hover:bg-brand-strong w-full`,
  primaryInline: `${base} bg-brand text-brand-ink px-4 py-2 text-sm shadow-sm hover:bg-brand-strong`,
  secondary: `${base} border border-border-strong text-ink px-5 py-2 hover:bg-surface-raised`,
  danger: `${base} text-negative px-3 py-1.5 text-sm hover:bg-negative/10 min-h-9`,
  ghost: `${base} text-ink-secondary px-3 py-1.5 text-sm hover:bg-surface-raised min-h-9`,
};

export const linkClasses =
  "inline-flex min-h-9 items-center text-sm text-ink-secondary underline underline-offset-2 " +
  "transition-opacity hover:opacity-70";
