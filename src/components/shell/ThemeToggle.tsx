"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/primitives";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; glyph: string }[] = [
  { value: "light", label: "Light", glyph: "○" },
  { value: "dark", label: "Dark", glyph: "●" },
  { value: "system", label: "System", glyph: "◐" },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("mdb-theme") as Theme | null) ?? "system";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem("mdb-theme", next);
    } catch {
      // Private browsing or blocked storage: the choice simply won't persist.
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center border border-line"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => choose(option.value)}
          title={`${option.label} theme`}
          className={cx(
            "flex size-7 items-center justify-center text-[11px] transition-colors duration-200",
            theme === option.value
              ? "bg-ink text-bg"
              : "text-muted hover:bg-surface-hover hover:text-ink",
          )}
        >
          <span aria-hidden>{option.glyph}</span>
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Applies the stored theme before paint so there is no flash of the wrong theme. */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('mdb-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;
