"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("walley-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("walley-theme", theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("walley-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  function cycle() {
    const next: Theme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    applyTheme(next);
  }

  const label =
    theme === "system" ? "Sistema" : theme === "light" ? "Claro" : "Oscuro";
  const icon = theme === "system" ? "🖥️" : theme === "light" ? "☀️" : "🌙";

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink-secondary transition-colors hover:bg-surface-raised"
      aria-label={`Tema: ${label}. Tocar para cambiar.`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
