"use client";

import { useState } from "react";
import { BenefitBars, BudgetBar, ProgressChart } from "@/components/ui/charts";
import {
  Definition,
  MonoLabel,
  StatusBadge,
  Unavailable,
  cx,
  toneForHealth,
  toneForSeverity,
} from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import {
  budgetVariance,
  deriveHealth,
  formatCurrency,
  formatDate,
  formatHealthDriver,
  formatNumber,
  issueCounts,
  plannedProgress,
  riskExposure,
  scheduleVariance,
  weightedProgress,
} from "@/lib/metrics";
import type { Measure, Project } from "@/lib/types";

const TABS = ["overview", "timeline", "risksIssues", "vendor", "benefits", "experience"] as const;
type Tab = (typeof TABS)[number];

/* ---------------------------------------------------------------- KPI cell */

function Kpi({
  label,
  children,
  definition,
  footer,
  span,
}: {
  label: string;
  children: React.ReactNode;
  definition: string;
  footer?: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={cx("space-y-3 p-6 lg:p-7", span && "lg:col-span-2")}>
      <div className="flex items-center gap-2">
        <MonoLabel>{label}</MonoLabel>
        <Definition text={definition} />
      </div>
      <div>{children}</div>
      {footer && <div className="border-t border-line pt-3">{footer}</div>}
    </div>
  );
}

const BigValue = ({ children, tone }: { children: React.ReactNode; tone?: "warn" | "risk" | "ok" }) => (
  <div
    className={cx(
      "tnum text-[30px] leading-none font-medium tracking-[-0.03em]",
      tone === "warn" ? "text-warn" : tone === "risk" ? "text-risk" : tone === "ok" ? "text-ok" : "text-ink",
    )}
  >
    {children}
  </div>
);

function MeasureValue<T>({
  measure,
  format,
  tone,
}: {
  measure: Measure<T>;
  format: (v: T) => string;
  tone?: "warn" | "risk" | "ok";
}) {
  if (measure.status === "unavailable") return <Unavailable reason={measure.reason} />;
  return <BigValue tone={tone}>{format(measure.value)}</BigValue>;
}

/* ---------------------------------------------------------------- Overview */

function Overview({ project, t }: { project: Project; t: Translations }) {
  const tk = t.project.kpi;
  const progress = weightedProgress(project);
  const planned = plannedProgress(project);
  const variance = scheduleVariance(project);
  const budgetVar = budgetVariance(project);
  const issues = issueCounts(project);
  const derived = deriveHealth(project);
  const currency = project.budget.currency;

  const topRisks = [...project.risks].sort((a, b) => riskExposure(b) - riskExposure(a)).slice(0, 3);
  const rankedIssues = [...project.issues].sort((a, b) => Number(b.overdue) - Number(a.overdue)).slice(0, 4);

  const driverText = derived.drivers.map((d) => formatHealthDriver(d, t)).join(" ");

  return (
    <>
      {/* KPI strip */}
      <div className="grid grid-cols-1 border-t border-line [&>*]:border-b [&>*]:border-line sm:grid-cols-2 [&>*]:sm:border-r lg:grid-cols-4">
        <Kpi
          label={tk.statusLabel}
          definition={tk.statusDefinition(driverText)}
          footer={
            <p className="text-[12px] leading-relaxed text-muted">
              {project.healthOverrideReason ?? formatHealthDriver(derived.drivers[0], t)}
            </p>
          }
        >
          <div className="space-y-2.5">
            <BigValue>{t.enum.stage[project.stage]}</BigValue>
            <StatusBadge tone={toneForHealth(project.health)}>{t.enum.health[project.health]}</StatusBadge>
          </div>
        </Kpi>

        <Kpi
          label={tk.progressLabel}
          definition={tk.progressDefinition}
          footer={
            <div className="flex justify-between">
              <MonoLabel>{tk.plannedPct(planned)}</MonoLabel>
              <span className={cx("tnum text-[12px]", variance < 0 ? "text-warn" : "text-ok")}>
                {tk.variancePct(variance)}
              </span>
            </div>
          }
        >
          <div className="space-y-3">
            <BigValue>{progress}%</BigValue>
            <div className="relative h-1.5 w-full bg-sunken">
              <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${progress}%` }} />
              <div className="absolute -top-0.5 -bottom-0.5 w-px bg-ink" style={{ left: `${planned}%` }} aria-hidden />
            </div>
          </div>
        </Kpi>

        <Kpi
          label={tk.budgetLabel}
          definition={tk.budgetDefinition(
            formatCurrency(project.budget.approved, currency),
            formatCurrency(project.budget.forecastAtCompletion, currency),
          )}
          footer={
            <div className="flex justify-between">
              <MonoLabel>{tk.variance}</MonoLabel>
              <span className={cx("tnum text-[12px]", budgetVar < 0 ? "text-risk" : "text-ok")}>
                {budgetVar < 0 ? "−" : "+"}
                {formatCurrency(Math.abs(budgetVar), currency, true)}
              </span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <BigValue>{formatCurrency(project.budget.actual, currency, true)}</BigValue>
            <MonoLabel>{tk.spentOf(formatCurrency(project.budget.approved, currency, true), currency)}</MonoLabel>
          </div>
        </Kpi>

        <Kpi
          label={tk.roiLabel}
          definition={tk.roiDefinition(project.roi.assumptions)}
          footer={
            <div className="flex justify-between">
              <MonoLabel>{tk.payback}</MonoLabel>
              <span className="tnum text-[12px] text-muted">
                {project.roi.paybackMonths.status === "available"
                  ? tk.months(project.roi.paybackMonths.value)
                  : t.common.dataUnavailable}
              </span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <MeasureValue measure={project.roi.expectedPct} format={(v) => `${formatNumber(v)}%`} />
            <MonoLabel>{tk.expected}</MonoLabel>
          </div>
        </Kpi>

        <Kpi
          label={tk.openIssuesLabel}
          definition={tk.openIssuesDefinition}
          footer={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {issues.bySeverity
                .filter((s) => s.count > 0)
                .map((s) => (
                  <span key={s.severity} className="mono-label">
                    {t.enum.severity[s.severity]} {s.count}
                  </span>
                ))}
              {issues.total === 0 && <MonoLabel>{tk.noOpenIssues}</MonoLabel>}
            </div>
          }
        >
          <BigValue tone={issues.overdue > 0 ? "warn" : undefined}>{issues.total}</BigValue>
          {issues.overdue > 0 && (
            <MonoLabel className="mt-1.5 text-warn">
              {issues.overdue} {t.project.lists.overdue}
            </MonoLabel>
          )}
        </Kpi>

        <Kpi
          label={tk.risksLabel}
          definition={tk.risksDefinition}
          footer={
            topRisks[0] ? (
              <p className="text-[12px] leading-relaxed text-muted">{tk.topRisk(topRisks[0].title, riskExposure(topRisks[0]))}</p>
            ) : (
              <MonoLabel>{tk.noOpenRisks}</MonoLabel>
            )
          }
        >
          <BigValue tone={project.risks.some((r) => r.severity === "Critical") ? "risk" : undefined}>
            {project.risks.length}
          </BigValue>
        </Kpi>

        <Kpi
          label={tk.vendorStatusLabel}
          definition={tk.vendorStatusDefinition}
          footer={
            project.vendor ? (
              <div className="flex justify-between">
                <MonoLabel>{tk.openActions}</MonoLabel>
                <span className="tnum text-[12px] text-ink">{project.vendor.openActions}</span>
              </div>
            ) : undefined
          }
        >
          {project.vendor ? (
            <div className="space-y-2.5">
              <BigValue>
                {project.vendor.milestonesComplete}/{project.vendor.milestonesTotal}
              </BigValue>
              <StatusBadge tone={toneForHealth(project.vendor.health)}>{t.enum.health[project.vendor.health]}</StatusBadge>
            </div>
          ) : (
            <Unavailable reason={tk.noVendor} />
          )}
        </Kpi>

        <Kpi
          label={tk.aiUsageLabel}
          definition={tk.aiUsageDefinition}
          footer={
            <div className="flex justify-between">
              <MonoLabel>{tk.actionsConfirmed}</MonoLabel>
              <span className="tnum text-[12px] text-ink">{project.ai.actionsConfirmed}</span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <BigValue>{project.ai.prompts}</BigValue>
            <MonoLabel>{tk.promptsSummary(project.ai.activeUsers, project.ai.estimatedHoursSaved)}</MonoLabel>
          </div>
        </Kpi>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 border-b border-line xl:grid-cols-2">
        <section className="border-b border-line p-6 xl:border-r xl:border-b-0 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <MonoLabel>{t.project.charts.progressTitle}</MonoLabel>
            <Definition text={t.project.charts.progressDefinition} />
          </div>
          <ProgressChart data={project.progressSeries} />
        </section>

        <section className="p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <MonoLabel>{t.project.charts.budgetTitle}</MonoLabel>
            <Definition text={t.project.charts.budgetDefinition} />
          </div>
          <BudgetBar
            approved={project.budget.approved}
            committed={project.budget.committed}
            actual={project.budget.actual}
            forecast={project.budget.forecastAtCompletion}
            format={(n) => formatCurrency(n, currency, true)}
          />
        </section>
      </div>

      {/* Ranked lists */}
      <div className="grid grid-cols-1 border-b border-line xl:grid-cols-2">
        <section className="border-b border-line xl:border-r xl:border-b-0">
          <header className="border-b border-line px-6 py-4 lg:px-8">
            <MonoLabel>{t.project.lists.topRisksByExposure}</MonoLabel>
          </header>
          {topRisks.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted lg:px-8">{t.project.lists.noRisksOnProject}</p>
          ) : (
            <ul>
              {topRisks.map((risk) => (
                <li key={risk.id} className="border-b border-line px-6 py-4 last:border-b-0 lg:px-8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <MonoLabel>{t.project.lists.riskMeta(risk.id, riskExposure(risk), risk.owner)}</MonoLabel>
                      <p className="text-[14px] leading-snug text-ink">{risk.title}</p>
                      <p className="text-[12px] leading-relaxed text-muted">
                        {risk.mitigation} — {t.enum.mitigationStatus[risk.mitigationStatus]}
                      </p>
                    </div>
                    <StatusBadge tone={toneForSeverity(risk.severity)}>{t.enum.severity[risk.severity]}</StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <header className="border-b border-line px-6 py-4 lg:px-8">
            <MonoLabel>{t.project.lists.openIssuesTitle}</MonoLabel>
          </header>
          {rankedIssues.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted lg:px-8">{t.project.lists.noIssuesOnProject}</p>
          ) : (
            <ul>
              {rankedIssues.map((issue) => (
                <li key={issue.id} className="border-b border-line px-6 py-4 last:border-b-0 lg:px-8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <MonoLabel>{t.project.lists.issueMeta(issue.id, issue.owner, issue.ageDays)}</MonoLabel>
                      <p className="text-[14px] leading-snug text-ink">{issue.title}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge tone={toneForSeverity(issue.severity)}>{t.enum.severity[issue.severity]}</StatusBadge>
                      {issue.overdue && <MonoLabel className="text-warn">{t.project.lists.overdue}</MonoLabel>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Timeline */

function Timeline({ project, t }: { project: Project; t: Translations }) {
  const tt = t.project.timeline;
  return (
    <div className="border-t border-line">
      <ul>
        {project.milestones.map((m, i) => {
          const late = m.actualDate && m.actualDate > m.plannedDate;
          return (
            <li key={m.id} className="grid grid-cols-[auto_1fr] gap-5 border-b border-line px-6 py-5 lg:px-8">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={cx(
                    "flex size-6 items-center justify-center border font-mono text-[10px]",
                    m.complete ? "border-accent bg-accent text-white" : "border-line text-faint",
                  )}
                >
                  {m.complete ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                {i < project.milestones.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </div>
              <div className="space-y-2 pb-1">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-[16px] leading-snug">{m.name}</h3>
                  <span className="mono-label">{tt.weight(m.weight)}</span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span className="mono-label">{tt.planned(formatDate(m.plannedDate))}</span>
                  {m.actualDate ? (
                    <span className={cx("mono-label", late ? "text-warn" : "text-ok")}>
                      {tt.actual(formatDate(m.actualDate))}
                    </span>
                  ) : (
                    <span className="mono-label">{tt.notComplete}</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------- Risks & issues */

function RisksIssues({ project, t }: { project: Project; t: Translations }) {
  const tr = t.project.risksIssues;
  return (
    <div className="border-t border-line">
      <section>
        <header className="border-b border-line px-6 py-4 lg:px-8">
          <MonoLabel>{tr.riskRegister}</MonoLabel>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line">
                {[tr.colId, tr.colRisk, tr.colSeverity, tr.colProbabilityImpact, tr.colOwner, tr.colMitigation].map((h) => (
                  <th key={h} scope="col" className="mono-label px-6 py-3 font-normal lg:px-8">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.risks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-muted lg:px-8">
                    {tr.noRisks}
                  </td>
                </tr>
              )}
              {project.risks.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="mono-label px-6 py-4 lg:px-8">{r.id}</td>
                  <td className="px-6 py-4 text-[14px] text-ink lg:px-8">{r.title}</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={toneForSeverity(r.severity)}>{t.enum.severity[r.severity]}</StatusBadge>
                  </td>
                  <td className="tnum px-6 py-4 text-[13px] text-ink lg:px-8">
                    {r.probability} × {r.impact} = {riskExposure(r)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">{r.owner}</td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">
                    {r.mitigation}
                    <span className="mono-label mt-1 block">{t.enum.mitigationStatus[r.mitigationStatus]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <header className="border-y border-line px-6 py-4 lg:px-8">
          <MonoLabel>{tr.issueRegister}</MonoLabel>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                {[tr.colId, tr.colIssue, tr.colSeverity, tr.colOwner, tr.colAge, tr.colState].map((h) => (
                  <th key={h} scope="col" className="mono-label px-6 py-3 font-normal lg:px-8">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.issues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-muted lg:px-8">
                    {tr.noIssues}
                  </td>
                </tr>
              )}
              {project.issues.map((i) => (
                <tr key={i.id} className="border-b border-line">
                  <td className="mono-label px-6 py-4 lg:px-8">{i.id}</td>
                  <td className="px-6 py-4 text-[14px] text-ink lg:px-8">{i.title}</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={toneForSeverity(i.severity)}>{t.enum.severity[i.severity]}</StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">{i.owner}</td>
                  <td className="tnum px-6 py-4 text-[13px] text-muted lg:px-8">{i.ageDays}d</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={i.overdue ? "warn" : "ok"}>{i.overdue ? tr.overdueBadge : tr.onTimeBadge}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ Vendor */

function Vendor({ project, t }: { project: Project; t: Translations }) {
  const tv = t.project.vendor;
  const v = project.vendor;
  if (!v) {
    return (
      <div className="border-t border-line px-6 py-16 text-center lg:px-8">
        <MonoLabel className="mb-3">{tv.noVendorLabel}</MonoLabel>
        <p className="text-[15px] text-muted">{tv.noVendorDescription}</p>
      </div>
    );
  }

  return (
    <div className="border-t border-line">
      <div className="grid grid-cols-1 border-b border-line [&>*]:border-b [&>*]:border-line sm:grid-cols-2 [&>*]:sm:border-r lg:grid-cols-4">
        <Kpi label={tv.vendorLabel} definition={tv.vendorDefinition}>
          <div className="space-y-2.5">
            <div className="text-[19px] leading-tight text-ink">{v.name}</div>
            <StatusBadge tone={toneForHealth(v.health)}>{t.enum.health[v.health]}</StatusBadge>
          </div>
        </Kpi>
        <Kpi label={tv.contractMilestonesLabel} definition={tv.contractMilestonesDefinition}>
          <BigValue>
            {v.milestonesComplete}/{v.milestonesTotal}
          </BigValue>
        </Kpi>
        <Kpi label={tv.openActionsLabel} definition={tv.openActionsDefinition}>
          <BigValue tone={v.openActions > 2 ? "warn" : undefined}>{v.openActions}</BigValue>
        </Kpi>
        <Kpi label={tv.lastUpdateLabel} definition={tv.lastUpdateDefinition}>
          <div className="tnum text-[19px] text-ink">{formatDate(v.lastUpdate)}</div>
          <MonoLabel className="mt-2">{v.contact}</MonoLabel>
        </Kpi>
      </div>

      <section className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-2">
          <MonoLabel>{tv.scorecard}</MonoLabel>
          <Definition text={tv.scorecardDefinition} />
        </div>
        <dl className="max-w-xl space-y-4">
          {[
            { label: tv.delivery, value: v.delivery },
            { label: tv.quality, value: v.quality },
            { label: tv.responsiveness, value: v.responsiveness },
          ].map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <MonoLabel>{row.label}</MonoLabel>
                <dd className={cx("tnum text-sm", row.value < 70 ? "text-warn" : "text-ink")}>{row.value}</dd>
              </div>
              <div className="h-1.5 w-full bg-sunken">
                <div
                  className={cx("h-full", row.value < 70 ? "bg-warn" : "bg-accent")}
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Benefits */

function Benefits({ project, t }: { project: Project; t: Translations }) {
  const tb = t.project.benefits;
  const b = project.benefit;
  const fteMax = Math.max(
    ...[b.plannedFte, b.validatedFte, b.realizedFte]
      .filter((m) => m.status === "available")
      .map((m) => (m as { value: number }).value),
    0.001,
  );
  const kwhMax = Math.max(
    ...[b.plannedKwh, b.validatedKwh, b.realizedKwh]
      .filter((m) => m.status === "available")
      .map((m) => (m as { value: number }).value),
    0.001,
  );

  const row = (label: string, m: Measure<number>, max: number, fmt: (n: number) => string) => ({
    label,
    value: m.status === "available" ? m.value : null,
    max,
    display: m.status === "available" ? fmt(m.value) : t.common.dataUnavailable,
  });

  return (
    <div className="grid grid-cols-1 border-t border-line xl:grid-cols-2">
      <section className="border-b border-line p-6 xl:border-r xl:border-b-0 lg:p-8">
        <div className="mb-2 flex items-center gap-2">
          <MonoLabel>{tb.hcSaving}</MonoLabel>
          <Definition text={tb.hcSavingDefinition} />
        </div>
        <p className="mb-6 text-[12px] text-muted">{b.measurementPeriod}</p>
        <BenefitBars
          rows={[
            row(tb.planned, b.plannedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
            row(tb.validated, b.validatedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
            row(tb.realized, b.realizedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
          ]}
        />
      </section>

      <section className="p-6 lg:p-8">
        <div className="mb-2 flex items-center gap-2">
          <MonoLabel>{tb.energySaving}</MonoLabel>
          <Definition text={tb.energySavingDefinition} />
        </div>
        <p className="mb-6 text-[12px] text-muted">{b.measurementPeriod}</p>
        <BenefitBars
          rows={[
            row(tb.planned, b.plannedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
            row(tb.validated, b.validatedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
            row(tb.realized, b.realizedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
          ]}
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------- Experience */

function Experience({ project, t }: { project: Project; t: Translations }) {
  const te = t.project.experience;
  const sections = [
    { label: te.context, body: te.contextValue(project.name, project.area, t.enum.stage[project.stage], project.lead.name) },
    { label: te.goalOutcome, body: te.notCaptured },
    { label: te.whatWorked, body: te.notCaptured },
    { label: te.issueRootCause, body: te.notCaptured },
    { label: te.countermeasure, body: te.notCaptured },
    { label: te.reusableArtifacts, body: te.notCaptured },
  ];

  return (
    <div className="border-t border-line">
      <div className="border-b border-line bg-accent-wash px-6 py-4 lg:px-8">
        {/* items-center, not items-start: the "+" is Latin-font ASCII but
            Chinese text falls back to the OS CJK font, whose ascent/leading
            proportions differ enough from Inter Tight that a margin nudge
            tuned for English baselines misaligns visibly under Chinese. */}
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-accent">
            +
          </span>
          <p className="text-[13px] leading-relaxed text-text">{te.banner}</p>
        </div>
      </div>
      <dl>
        {sections.map((s) => (
          <div key={s.label} className="border-b border-line px-6 py-5 lg:px-8">
            <MonoLabel>{s.label}</MonoLabel>
            <dd
              className={cx(
                "mt-2 text-[14px] leading-relaxed",
                s.body === te.notCaptured ? "text-faint" : "text-text",
              )}
            >
              {s.body}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------- Tabs */

export function ProjectTabs({ project }: { project: Project }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("overview");
  const tabLabel: Record<Tab, string> = t.project.tabs;

  return (
    <>
      <div role="tablist" aria-label={t.project.tabsAria} className="flex overflow-x-auto border-b border-line px-5 lg:px-8">
        {TABS.map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => setTab(tb)}
            className={cx(
              "shrink-0 border-b-2 px-4 py-3.5 text-[13px] transition-colors duration-200 first:pl-0",
              tab === tb
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tabLabel[tb]}
          </button>
        ))}
      </div>

      <div className="rise" key={tab}>
        {tab === "overview" && <Overview project={project} t={t} />}
        {tab === "timeline" && <Timeline project={project} t={t} />}
        {tab === "risksIssues" && <RisksIssues project={project} t={t} />}
        {tab === "vendor" && <Vendor project={project} t={t} />}
        {tab === "benefits" && <Benefits project={project} t={t} />}
        {tab === "experience" && <Experience project={project} t={t} />}
      </div>
    </>
  );
}
