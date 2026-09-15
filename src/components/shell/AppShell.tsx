"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MonoLabel, cx } from "@/components/ui/primitives";
import { AgentPanel } from "./AgentPanel";
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
  const [agentOpen, setAgentOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const NAV = [
    { href: "/", label: t.nav.home, glyph: "◧" },
    { href: "/portfolio", label: t.nav.portfolio, glyph: "▤" },
    { href: "/knowledge", label: t.nav.knowledge, glyph: "◈" },
    { href: "/analytics", label: t.nav.analytics, glyph: "◠" },
    { href: "/admin", label: t.nav.administration, glyph: "⚙" },
  ];

  // Below lg the sidebar is off-canvas, so the route it would otherwise be
  // reachable from — the persistent left nav — is gone unless this closes
  // itself on navigation and on Escape, same as ConfirmDialog.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="flex min-h-dvh">
        {/* Sidebar. Fixed + off-canvas (translate-x) below lg, where it opens
            as a drawer over a backdrop; in-flow and always visible at lg+ —
            the lg: classes below win at that breakpoint regardless of
            mobileNavOpen, so desktop is unaffected by the drawer state. */}
        <nav
          aria-label={t.nav.primaryLandmark}
          className={cx(
            "fixed inset-y-0 left-0 z-40 flex w-[260px] max-w-[85vw] flex-col overflow-y-auto border-r border-line bg-surface transition-transform duration-200 ease-out",
            "lg:sticky lg:top-0 lg:h-dvh lg:w-[216px] lg:shrink-0 lg:translate-x-0",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Wordmark />
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label={t.nav.closeMenu}
              className="flex size-7 items-center justify-center border border-line text-muted transition-colors hover:border-ink hover:text-ink lg:hidden"
            >
              <span aria-hidden>✕</span>
            </button>
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

        {mobileNavOpen && (
          <div
            aria-hidden
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-[35] bg-ink/50 lg:hidden"
          />
        )}

        {/* Main column */}
        {/* Padding compensation must start at the same breakpoint as the
            fixed agent panel itself (no breakpoint — always on lg+ screens
            per AgentPanel's width), not a wider one: between lg and xl the
            content previously had no compensation while the panel (z-40,
            above the header's z-30) still covered the header's right edge,
            making the header's own controls — theme, language, even the
            agent toggle button — unclickable in that range. */}
        <div className={cx("flex min-w-0 flex-1 flex-col transition-[padding] duration-200", agentOpen && "lg:pr-[380px]")}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-surface/92 px-5 py-3 backdrop-blur-sm lg:px-8">
            <button
              onClick={() => {
                setMobileNavOpen((v) => !v);
                setAgentOpen(false);
              }}
              aria-expanded={mobileNavOpen}
              aria-label={t.nav.openMenu}
              className="flex size-7 items-center justify-center border border-line text-ink transition-colors hover:border-ink hover:bg-surface-hover lg:hidden"
            >
              <span aria-hidden className="flex flex-col items-center gap-[3px]">
                <span className="h-px w-3.5 bg-current" />
                <span className="h-px w-3.5 bg-current" />
                <span className="h-px w-3.5 bg-current" />
              </span>
            </button>

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
                onClick={() => {
                  setAgentOpen((v) => !v);
                  setMobileNavOpen(false);
                }}
                aria-expanded={agentOpen}
                className={cx(
                  "flex items-center gap-2 border px-3 py-1.5 text-[13px] transition-colors duration-200",
                  agentOpen
                    ? "border-ink bg-ink text-bg"
                    : "border-line text-ink hover:border-ink hover:bg-surface-hover",
                )}
              >
                <span aria-hidden className="size-1.5 bg-accent" />
                {t.agent.name}
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-line px-5 py-5 lg:px-8">
            <p className="mono-label leading-relaxed">{t.footer.trademark}</p>
          </footer>
        </div>
      </div>

      <AgentPanel open={agentOpen} onClose={() => setAgentOpen(false)} />
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
