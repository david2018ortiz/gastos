"use client";

import { useState } from "react";

export type TagOption = { id: string; name: string };

/**
 * Deja elegir entre las etiquetas ya creadas (chips) y además escribir
 * nuevas separadas por coma. El valor que viaja al formulario es siempre
 * la lista completa separada por comas, que es lo que espera el server
 * action (`linkTags` crea las que no existan).
 */
export function TagPicker({
  name = "tags",
  availableTags,
  defaultSelected = [],
  compact = false,
}: {
  name?: string;
  availableTags: TagOption[];
  defaultSelected?: string[];
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [draft, setDraft] = useState("");

  function toggle(tagName: string) {
    setSelected((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  }

  function commitDraft() {
    const parsed = draft
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (parsed.length === 0) return;
    setSelected((prev) => Array.from(new Set([...prev, ...parsed])));
    setDraft("");
  }

  // Etiquetas creadas al vuelo que aún no están en la lista guardada.
  const extras = selected.filter(
    (s) => !availableTags.some((t) => t.name === s),
  );

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={selected.join(", ")} />

      {(availableTags.length > 0 || extras.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const active = selected.includes(tag.name);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.name)}
                aria-pressed={active}
                className={
                  "rounded-full border px-2.5 py-1 text-xs transition-colors " +
                  (active
                    ? "border-brand bg-brand-soft text-ink"
                    : "border-border text-ink-secondary")
                }
              >
                {tag.name}
              </button>
            );
          })}
          {extras.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => toggle(tagName)}
              aria-pressed
              className="rounded-full border border-brand bg-brand-soft px-2.5 py-1 text-xs text-ink"
            >
              {tagName}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          }
        }}
        placeholder={
          compact ? "Nueva etiqueta…" : "Escribe una etiqueta nueva y pulsa Enter"
        }
        className="w-full rounded-xl border px-3 py-2 text-sm"
      />
    </div>
  );
}
