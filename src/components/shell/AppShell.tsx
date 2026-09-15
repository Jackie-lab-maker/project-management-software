"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import { MonoLabel, cx } from "@/components/ui/primitives";
import { JasonPanel } from "./JasonPanel";
import { MicronLogo } from "./MicronLogo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home", glyph: "◧" },
  { href: "/portfolio", label: "Portfolio", glyph: "▤" },
  { href: "/knowledge", label: "Knowledge", glyph: "◈" },
  { href: "/analytics", label: "Analytics", glyph: "◠" },
  { href: "/admin", label: "Administration", glyph: "⚙" },
];

function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="Micron — Automation Digital Brain home"
      className="inline-flex transition-opacity hover:opacity-70"
    >
      {/* Pure black / pure white rather than the near-black text token: those are
          the two variants the mark is published in, so it is never tinted. */}
      <MicronLogo className="h-[22px] w-auto text-black dark:text-white" />
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [jasonOpen, setJasonOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <nav
          aria-label="Primary"
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
            <MonoLabel>Signed in</MonoLabel>
            <div className="mt-2 flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex size-7 items-center justify-center border border-line font-mono text-[10px] text-ink"
              >
                {currentUser.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] leading-tight text-ink">{currentUser.name}</div>
                <div className="mono-label mt-0.5 truncate">{currentUser.role}</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main column */}
        <div className={cx("flex min-w-0 flex-1 flex-col transition-[padding] duration-200", jasonOpen && "xl:pr-[380px]")}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-line bg-surface/92 px-5 py-3 backdrop-blur-sm lg:px-8">
            <div className="lg:hidden">
              <Wordmark />
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <label htmlFor="global-search" className="sr-only">
                Search projects and knowledge
              </label>
              <input
                id="global-search"
                type="search"
                placeholder="Search projects, documents…"
                className="hidden w-56 border border-line bg-bg px-3 py-1.5 text-[13px] text-text placeholder:text-faint focus:border-ink focus:outline-none md:block"
              />
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
                Jason
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-line px-5 py-5 lg:px-8">
            <p className="mono-label leading-relaxed">
              Micron™ and the Micron orbit logo are trademarks of Micron Technology, Inc. · Internal
              use only · Confirm final wording with Micron legal and brand owners before production.
            </p>
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
