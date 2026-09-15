import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/* ----------------------------------------------------------------
   MonoLabel — the reference's signature eyebrow: mono, caps, tracked.
   ---------------------------------------------------------------- */

export function MonoLabel({
  children,
  tone = "faint",
  className,
}: {
  children: ReactNode;
  tone?: "faint" | "muted" | "accent";
  className?: string;
}) {
  const tones = {
    faint: "text-faint",
    muted: "text-muted",
    accent: "text-accent",
  } as const;
  return <div className={cx("mono-label", tones[tone], className)}>{children}</div>;
}

/** Numeric index marker, e.g. [01] — used to enumerate genuine sequences only. */
export function IndexMark({ n, className }: { n: number; className?: string }) {
  return <span className={cx("mono-label text-faint", className)}>[{String(n).padStart(2, "0")}]</span>;
}

/* ----------------------------------------------------------------
   Buttons — flat, sharp-cornered, no shadows.
   ---------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[2px] px-4 py-2.5 text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-bg hover:bg-accent",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-hover hover:border-ink",
  ghost: "text-muted hover:text-ink hover:bg-surface-hover",
  danger: "border border-risk/40 text-risk hover:bg-risk-wash",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

/** Inline accent link with the reference's trailing arrow. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "group inline-flex items-center gap-1.5 text-sm text-accent transition-colors duration-200 hover:text-accent-hover",
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

/* ----------------------------------------------------------------
   Hairline grid — cards are cells divided by 1px rules, not floating boxes.
   ---------------------------------------------------------------- */

export function GridRow({
  children,
  cols = 3,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
    6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[cols];
  return (
    <div
      className={cx(
        "grid grid-cols-1 border-t border-line [&>*]:border-b [&>*]:border-line",
        "[&>*]:sm:border-r",
        colClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  label,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  label?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cx("border border-line bg-surface", className)}>
      {(title || label || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="space-y-1.5">
            {label && <MonoLabel>{label}</MonoLabel>}
            {title && <h2 className="text-[17px] leading-tight">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ----------------------------------------------------------------
   Status — always text + shape, never colour alone (spec §4).
   ---------------------------------------------------------------- */

export type StatusTone = "ok" | "warn" | "risk" | "none";

const statusGlyph: Record<StatusTone, string> = {
  ok: "●",
  warn: "▲",
  risk: "■",
  none: "–",
};

const statusStyle: Record<StatusTone, string> = {
  ok: "text-ok bg-ok-wash",
  warn: "text-warn bg-warn-wash",
  risk: "text-risk bg-risk-wash",
  none: "text-none bg-none-wash",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase",
        statusStyle[tone],
        className,
      )}
    >
      <span aria-hidden className="text-[8px] leading-none">
        {statusGlyph[tone]}
      </span>
      {children}
    </span>
  );
}

export function toneForHealth(health: string): StatusTone {
  if (health === "On Track") return "ok";
  if (health === "At Risk") return "warn";
  if (health === "Off Track") return "risk";
  return "none";
}

export function toneForSeverity(severity: string): StatusTone {
  if (severity === "Critical") return "risk";
  if (severity === "High") return "warn";
  if (severity === "Medium") return "none";
  return "none";
}

/* ----------------------------------------------------------------
   Definition drawer — every calculated metric must expose its assumptions.
   ---------------------------------------------------------------- */

export function Definition({ text }: { text: string }) {
  return (
    <span className="group/def relative inline-flex">
      <button
        type="button"
        aria-label="Show calculation assumptions"
        className="flex size-4 items-center justify-center rounded-full border border-line font-mono text-[9px] text-faint transition-colors hover:border-ink hover:text-ink"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 border border-line bg-surface p-3 text-xs leading-relaxed text-muted opacity-0 transition-opacity duration-200 group-hover/def:opacity-100 group-focus-within/def:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

/** Renders an unavailable metric distinctly so it never reads as zero. */
export function Unavailable({ reason }: { reason?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      <span className="text-[15px]">Data unavailable</span>
      {reason && <Definition text={reason} />}
    </span>
  );
}
