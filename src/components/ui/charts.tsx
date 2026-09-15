"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ProgressPoint } from "@/lib/types";
import { MonoLabel } from "./primitives";

/**
 * Planned vs actual progress. Series are distinguished by line style as well as
 * colour (dashed = planned, solid = actual) so the chart survives greyscale and
 * colour-vision differences.
 */
export function ProgressChart({ data, height = 168 }: { data: ProgressPoint[]; height?: number }) {
  const { t } = useLanguage();
  const width = 560;
  const padX = 8;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const x = (i: number) => padX + (i / Math.max(data.length - 1, 1)) * innerW;
  const y = (v: number) => padY + innerH - (v / 100) * innerH;

  const line = (key: "planned" | "actual") =>
    data
      .map((d, i) => (d[key] === null ? null : `${x(i)},${y(d[key] as number)}`))
      .filter(Boolean)
      .join(" ");

  const lastActual = [...data].reverse().find((d) => d.actual !== null);

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={t.chart.progressAria}
        preserveAspectRatio="none"
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <line
            key={tick}
            x1={padX}
            x2={width - padX}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--line)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <polyline
          points={line("planned")}
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={line("actual")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />

        {data.map((d, i) =>
          d.actual === null ? null : (
            <circle key={d.label} cx={x(i)} cy={y(d.actual)} r={2.5} fill="var(--accent)" />
          ),
        )}
      </svg>

      <div className="flex items-center justify-between">
        <div className="flex gap-5">
          <span className="flex items-center gap-2">
            <svg width="18" height="2" aria-hidden>
              <line x1="0" y1="1" x2="18" y2="1" stroke="var(--text-faint)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            <MonoLabel>{t.chart.planned}</MonoLabel>
          </span>
          <span className="flex items-center gap-2">
            <svg width="18" height="2" aria-hidden>
              <line x1="0" y1="1" x2="18" y2="1" stroke="var(--accent)" strokeWidth="2" />
            </svg>
            <MonoLabel tone="accent">{t.chart.actual}</MonoLabel>
          </span>
        </div>
        {lastActual && (
          <MonoLabel>
            {lastActual.label} · {lastActual.actual}%
          </MonoLabel>
        )}
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>{t.chart.captionText}</caption>
          <thead>
            <tr>
              <th scope="col">{t.chart.colPeriod}</th>
              <th scope="col">{t.chart.colPlannedPct}</th>
              <th scope="col">{t.chart.colActualPct}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{d.planned}</td>
                <td>{d.actual === null ? t.common.dataUnavailable : d.actual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Segmented budget bar: actual and committed read against the approved envelope. */
export function BudgetBar({
  approved,
  committed,
  actual,
  forecast,
  format,
}: {
  approved: number;
  committed: number;
  actual: number;
  forecast: number;
  format: (n: number) => string;
}) {
  const { t } = useLanguage();
  const scale = Math.max(approved, forecast);
  const pct = (v: number) => `${(v / scale) * 100}%`;
  const overrun = forecast > approved;

  return (
    <div className="space-y-3">
      <div className="relative h-8 w-full border border-line bg-sunken">
        <div className="absolute inset-y-0 left-0 bg-accent/30" style={{ width: pct(committed) }} />
        <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: pct(actual) }} />
        <div
          className="absolute inset-y-0 w-px bg-ink"
          style={{ left: pct(approved) }}
          aria-hidden
        />
        <div
          className={`absolute -top-1 -bottom-1 w-px ${overrun ? "bg-risk" : "bg-ok"}`}
          style={{ left: pct(forecast) }}
          aria-hidden
        />
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {[
          { term: t.chart.budgetActual, value: actual, swatch: "bg-accent" },
          { term: t.chart.budgetCommitted, value: committed, swatch: "bg-accent/30 outline outline-accent/50" },
          { term: t.chart.budgetApproved, value: approved, swatch: "bg-ink" },
          { term: t.chart.budgetForecast, value: forecast, swatch: overrun ? "bg-risk" : "bg-ok" },
        ].map((row) => (
          <div key={row.term} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2 ${row.swatch}`} />
              <MonoLabel>{row.term}</MonoLabel>
            </div>
            <dd className="tnum text-sm text-ink">{format(row.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Planned / validated / realized benefit track. */
export function BenefitBars({
  rows,
}: {
  rows: { label: string; value: number | null; max: number; display: string }[];
}) {
  return (
    <dl className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <MonoLabel>{row.label}</MonoLabel>
            <dd className={`tnum text-sm ${row.value === null ? "text-muted" : "text-ink"}`}>{row.display}</dd>
          </div>
          <div className="h-1.5 w-full bg-sunken">
            {row.value !== null && (
              <div
                className="h-full bg-accent"
                style={{ width: `${row.max > 0 ? Math.min((row.value / row.max) * 100, 100) : 0}%` }}
              />
            )}
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Horizontal distribution bar used for portfolio stage mix. */
export function StageDistribution({
  segments,
}: {
  segments: { label: string; count: number }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0) || 1;
  const shades = ["bg-ink", "bg-accent", "bg-accent/60", "bg-accent/35", "bg-line", "bg-sunken"];
  return (
    <div className="space-y-3">
      <div className="flex h-8 w-full overflow-hidden border border-line">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className={shades[i % shades.length]}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden className={`size-2 shrink-0 ${shades[i % shades.length]}`} />
              <MonoLabel className="truncate">{s.label}</MonoLabel>
            </span>
            <span className="tnum shrink-0 text-sm text-ink">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
