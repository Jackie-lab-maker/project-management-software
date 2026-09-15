"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Lang, type Translations } from "./translations";

const STORAGE_KEY = "mdb-lang";

/**
 * Chinese is the default for this deployment; English is opt-in through the
 * header toggle. Keep this in sync with <html lang> in layout.tsx, which is
 * what the server renders before any stored choice is known.
 */
export const DEFAULT_LANG: Lang = "zh";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server-rendered output has no access to localStorage, so it — and the
  // first client render, to avoid a hydration mismatch — is always the
  // default language. The effect below swaps to the stored choice
  // immediately after mount, same tradeoff ThemeToggle makes for colour,
  // just without an anti-FOUC script: a text-content re-render on mount is
  // a much smaller flash than a colour flash would be.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") setLangState(stored);
    } catch {
      // Private browsing or blocked storage: stays on the default.
    }
  }, []);

  // Keeps <html lang> correct for screen readers and browser translation
  // prompts — layout.tsx can't set this itself since it renders on the
  // server, before any client-side language choice is known.
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing or blocked storage: the choice simply won't persist.
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

/** Shorthand for the common case of only needing the dictionary. */
export function useT(): Translations {
  return useLanguage().t;
}
