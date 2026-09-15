"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MonoLabel, cx } from "@/components/ui/primitives";
import { JasonPanel } from "./JasonPanel";
import { LanguageToggle } from "./LanguageToggle";
import { MicronLogo } from "./MicronLogo";
import { ThemeToggle } from "./ThemeToggle";

function Wordmark() {
  const { t } = useLanguage();
  return (
    <Link
      href="/"
      aria-label={t.nav.micronHome}
      className="inline-flex transition-opacity hover:opacity-70"
    >
      {/* --logo is pure black/white rather than the near-black --ink token:
          those are the two variants the mark is published in, so it is
          never tinted. */}
      <MicronLogo className="h-[22px] w-auto text-logo" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [jasonOpen, setJasonOpen] = useState(false);

  const NAV = [
    { href: "/", label: t.nav.home, glyph: "◧" },
    { href: "/portfolio", label: t.nav.portfolio, glyph: "▤" },
    { href: "/knowledge", label: t.nav.knowledge, glyph: "◈" },
    { href: "/analytics", label: t.nav.analytics, glyph: "◠" },
    { href: "/admin", label: t.nav.administration, glyph: "⚙" },
  ];

  return (
    <div className="min-h-dvh bg-bg">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <nav
          aria-label={t.nav.primaryLandmark}
          className="sticky top-0 hidden h-dvh w-[216px] shrink-0 flex-col border-r border-line bg-surface lg:flex"
        >
          <div className="border-b border-line px-5 py-4">
            <Wordmark />
          </div>

          <ul className="flex-1 py-2">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex items-center gap-3 border-l-2 px-5 py-2.5 text-sm transition-colors duration-200",
                      active
                        ? "border-accent bg-sunken text-ink"
                        : "border-transparent text-muted hover:bg-surface-hover hover:text-ink",
                    )}
                  >
                    <span aria-hidden className="w-4 text-center text-[13px]">
                      {item.glyph}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-line px-5 py-4">
            <MonoLabel>{t.nav.signedIn}</MonoLabel>
            <div className="mt-2 flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-7 items-center justify-center border border-line font-mono text-[10px] text-ink"
              >
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] leading-tight text-ink">{currentUser.name}</div>
                <div className="mono-label mt-0.5 truncate">{t.enum.role[currentUser.role]}</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main column */}
        {/* Padding compensation must start at the same breakpoint as the
            fixed Jason panel itself (no breakpoint — always on lg+ screens
            per JasonPanel's width), not a wider one: between lg and xl the
            content previously had no compensation while the panel (z-40,
            above the header's z-30) still covered the header's right edge,
            making the header's own controls — theme, language, even the
            Jason toggle button — unclickable in that range. */}
        <div className={cx("flex min-w-0 flex-1 flex-col transition-[padding] duration-200", jasonOpen && "lg:pr-[380px]")}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-surface/92 px-5 py-3 backdrop-blur-sm lg:px-8">
            <div className="lg:hidden">
              <Wordmark />
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <label htmlFor="global-search" className="sr-only">
                {t.nav.searchAria}
              </label>
              <input
                id="global-search"
                type="search"
                placeholder={t.nav.searchPlaceholder}
                className="hidden w-56 border border-line bg-bg px-3 py-1.5 text-[13px] text-text placeholder:text-faint focus:border-ink focus:outline-none md:block"
              />
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={() => setJasonOpen((v) => !v)}
                aria-expanded={jasonOpen}
                className={cx(
                  "flex items-center gap-2 border px-3 py-1.5 text-[13px] transition-colors duration-200",
                  jasonOpen
                    ? "border-ink bg-ink text-bg"
                    : "border-line text-ink hover:border-ink hover:bg-surface-hover",
                )}
              >
                <span aria-hidden className="size-1.5 bg-accent" />
                {t.nav.jason}
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-line px-5 py-5 lg:px-8">
            <p className="mono-label leading-relaxed">{t.footer.trademark}</p>
          </footer>
        </div>
      </div>

      <JasonPanel open={jasonOpen} onClose={() => setJasonOpen(false)} />
    </div>
  );
}

/** Page header used by every screen — mono eyebrow, tight headline, optional actions. */
export function PageHeader({
  label,
  title,
  description,
  actions,
  meta,
}: {
  label: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="border-b border-line px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <MonoLabel tone="accent">{label}</MonoLabel>
          <h1 className="text-[32px] leading-[1.06] lg:text-[40px]">{title}</h1>
          {description && <p className="text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
      {meta && <div className="mt-6">{meta}</div>}
    </div>
  );
}
