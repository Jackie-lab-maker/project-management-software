"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// Explicit dark is intentionally not offered — only Light (forced) and
// System (follows the OS, which may itself be dark; see the
// prefers-color-scheme block in globals.css).
type Theme = "light" | "system";

const GLYPH: Record<Theme, string> = { light: "○", system: "◐" };

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("system");

  const OPTIONS: { value: Theme; label: string }[] = [
    { value: "light", label: t.theme.light },
    { value: "system", label: t.theme.system },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("mdb-theme");
    // A stale "dark" value from before dark mode was removed falls back to
    // System rather than forcing a state that's no longer selectable.
    const initial: Theme = stored === "light" ? "light" : "system";
    setTheme(initial);
    applyTheme(initial);
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
      aria-label={t.theme.colourTheme}
      className="flex items-center border border-line"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={theme === option.value}
          onClick={() => choose(option.value)}
          title={option.label}
          className={cx(
            "flex size-7 items-center justify-center text-[11px] transition-colors duration-200",
            theme === option.value
              ? "bg-ink text-bg"
              : "text-muted hover:bg-surface-hover hover:text-ink",
          )}
        >
          <span aria-hidden>{GLYPH[option.value]}</span>
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
    if (localStorage.getItem('mdb-theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;
