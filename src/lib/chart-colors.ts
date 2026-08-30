// Paleta categórica validada (dataviz skill) — orden fijo, nunca ciclado
// aleatoriamente. El color de cada entidad (categoría o etiqueta) se asigna
// de forma determinística por su id, no por su posición/monto, para que no
// cambie cuando cambian los datos.
export const CATEGORICAL_PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
] as const;

function hashToIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function colorForId(id: string): string {
  return CATEGORICAL_PALETTE[hashToIndex(id, CATEGORICAL_PALETTE.length)];
}
