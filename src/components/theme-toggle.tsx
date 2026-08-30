"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("walley-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("walley-theme");
    if (stored === "dark") {
      setTheme("dark");
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }

  const label = theme === "light" ? "Claro" : "Oscuro";
  const icon = theme === "light" ? "☀️" : "🌙";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink-secondary transition-colors hover:bg-surface-raised"
      aria-label={`Tema ${label}. Tocar para cambiar a ${theme === "light" ? "oscuro" : "claro"}.`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
