"use client";

import { cx } from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Lang } from "@/lib/i18n/translations";

const OPTIONS: { value: Lang; glyph: string }[] = [
  { value: "en", glyph: "EN" },
  { value: "zh", glyph: "中" },
];

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div role="radiogroup" aria-label={t.language.label} className="flex items-center border border-line">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={lang === option.value}
          onClick={() => setLang(option.value)}
          title={option.value === "en" ? t.language.english : t.language.chineseSimplified}
          className={cx(
            "flex h-7 min-w-7 items-center justify-center px-1.5 font-mono text-[10px] transition-colors duration-200",
            lang === option.value ? "bg-ink text-bg" : "text-muted hover:bg-surface-hover hover:text-ink",
          )}
        >
          {option.glyph}
        </button>
      ))}
    </div>
  );
}
