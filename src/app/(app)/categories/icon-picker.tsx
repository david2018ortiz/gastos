"use client";

import { useState } from "react";

const ICONS = [
  "🍔", "🍕", "☕", "🛒", "🍽️",
  "🚌", "🚗", "⛽", "🚕", "✈️",
  "🏠", "💡", "💧", "📶", "🔧",
  "💊", "🏥", "🩺", "🦷", "🏋️",
  "🎬", "🎮", "🎵", "📚", "🎉",
  "👕", "👟", "💇", "🛍️", "🎁",
  "🐶", "🐱", "🧒", "🎓", "✏️",
  "💰", "💵", "💳", "🏦", "📈",
  "🧾", "📱", "💻", "🔒", "❤️",
] as const;

export function IconPicker({ defaultValue }: { defaultValue?: string | null }) {
  const [selected, setSelected] = useState(defaultValue ?? "");

  return (
    <div className="space-y-2">
      <input type="hidden" name="icon" value={selected} />
      <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto rounded-md border p-2">
        {ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => setSelected(icon === selected ? "" : icon)}
            aria-pressed={icon === selected}
            aria-label={`Ícono ${icon}`}
            className={
              "flex h-8 w-8 items-center justify-center rounded-md text-base " +
              (icon === selected
                ? "bg-brand text-brand-ink"
                : "hover:bg-surface-raised")
            }
          >
            {icon}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-ink-muted">
          Seleccionado: <span className="text-base">{selected}</span>
        </p>
      )}
    </div>
  );
}
