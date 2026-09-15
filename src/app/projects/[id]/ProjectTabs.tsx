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
import {
  budgetVariance,
  deriveHealth,
  formatCurrency,
  formatDate,
  formatNumber,
  issueCounts,
  plannedProgress,
  riskExposure,
  scheduleVariance,
  weightedProgress,
} from "@/lib/metrics";
import type { Measure, Project } from "@/lib/types";

const TABS = ["Overview", "Timeline", "Risks & issues", "Vendor", "Benefits", "Experience"] as const;
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

function Overview({ project }: { project: Project }) {
  const progress = weightedProgress(project);
  const planned = plannedProgress(project);
  const variance = scheduleVariance(project);
  const budgetVar = budgetVariance(project);
  const issues = issueCounts(project);
  const derived = deriveHealth(project);
  const currency = project.budget.currency;

  const topRisks = [...project.risks].sort((a, b) => riskExposure(b) - riskExposure(a)).slice(0, 3);
  const rankedIssues = [...project.issues].sort((a, b) => Number(b.overdue) - Number(a.overdue)).slice(0, 4);

  return (
    <>
      {/* KPI strip */}
      <div className="grid grid-cols-1 border-t border-line [&>*]:border-b [&>*]:border-line sm:grid-cols-2 [&>*]:sm:border-r lg:grid-cols-4">
        <Kpi
          label="Project status"
          definition={`Health is derived from schedule, risk, issue and budget rules. Drivers: ${derived.drivers.join(" ")}`}
          footer={
            <p className="text-[12px] leading-relaxed text-muted">
              {project.healthOverrideReason ?? derived.drivers[0]}
            </p>
          }
        >
          <div className="space-y-2.5">
            <BigValue>{project.stage}</BigValue>
            <StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>
          </div>
        </Kpi>

        <Kpi
          label="Project progress"
          definition="Percent complete from weighted milestones. Planned progress is interpolated from the milestone baseline. A manual override is audited and shown alongside, never instead of, the weighted roll-up."
          footer={
            <div className="flex justify-between">
              <MonoLabel>Planned {planned}%</MonoLabel>
              <span className={cx("tnum text-[12px]", variance < 0 ? "text-warn" : "text-ok")}>
                {variance > 0 ? "+" : ""}
                {variance}% variance
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
          label="Budget"
          definition={`Approved ${formatCurrency(project.budget.approved, currency)}; forecast at completion ${formatCurrency(project.budget.forecastAtCompletion, currency)}. Variance is approved minus forecast.`}
          footer={
            <div className="flex justify-between">
              <MonoLabel>Variance</MonoLabel>
              <span className={cx("tnum text-[12px]", budgetVar < 0 ? "text-risk" : "text-ok")}>
                {budgetVar < 0 ? "−" : "+"}
                {formatCurrency(Math.abs(budgetVar), currency, true)}
              </span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <BigValue>{formatCurrency(project.budget.actual, currency, true)}</BigValue>
            <MonoLabel>
              spent of {formatCurrency(project.budget.approved, currency, true)} {currency}
            </MonoLabel>
          </div>
        </Kpi>

        <Kpi
          label="ROI"
          definition={`(annualized quantified benefit − annual operating cost) / total project cost × 100. Assumptions: ${project.roi.assumptions}`}
          footer={
            <div className="flex justify-between">
              <MonoLabel>Payback</MonoLabel>
              <span className="tnum text-[12px] text-muted">
                {project.roi.paybackMonths.status === "available"
                  ? `${project.roi.paybackMonths.value} months`
                  : "Data unavailable"}
              </span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <MeasureValue measure={project.roi.expectedPct} format={(v) => `${formatNumber(v)}%`} />
            <MonoLabel>Expected</MonoLabel>
          </div>
        </Kpi>

        <Kpi
          label="Open issues"
          definition="Count by severity with age. Overdue means the owner action date has passed."
          footer={
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {issues.bySeverity
                .filter((s) => s.count > 0)
                .map((s) => (
                  <span key={s.severity} className="mono-label">
                    {s.severity} {s.count}
                  </span>
                ))}
              {issues.total === 0 && <MonoLabel>No open issues</MonoLabel>}
            </div>
          }
        >
          <BigValue tone={issues.overdue > 0 ? "warn" : undefined}>{issues.total}</BigValue>
          {issues.overdue > 0 && <MonoLabel className="mt-1.5 text-warn">{issues.overdue} overdue</MonoLabel>}
        </Kpi>

        <Kpi
          label="Risks"
          definition="Exposure is probability × impact on a 1–5 scale. Top risks are ranked by exposure."
          footer={
            topRisks[0] ? (
              <p className="text-[12px] leading-relaxed text-muted">
                Top: {topRisks[0].title} (exposure {riskExposure(topRisks[0])})
              </p>
            ) : (
              <MonoLabel>No open risks</MonoLabel>
            )
          }
        >
          <BigValue tone={project.risks.some((r) => r.severity === "Critical") ? "risk" : undefined}>
            {project.risks.length}
          </BigValue>
        </Kpi>

        <Kpi
          label="Vendor status"
          definition="Vendor health combines contractual milestone completion with delivery, quality and responsiveness scores."
          footer={
            project.vendor ? (
              <div className="flex justify-between">
                <MonoLabel>Open actions</MonoLabel>
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
              <StatusBadge tone={toneForHealth(project.vendor.health)}>{project.vendor.health}</StatusBadge>
            </div>
          ) : (
            <Unavailable reason="No vendor is attached to this project." />
          )}
        </Kpi>

        <Kpi
          label="AI usage"
          definition="Jason activity scoped to this project. Prompt text is never exposed to users without permission."
          footer={
            <div className="flex justify-between">
              <MonoLabel>Actions confirmed</MonoLabel>
              <span className="tnum text-[12px] text-ink">{project.ai.actionsConfirmed}</span>
            </div>
          }
        >
          <div className="space-y-1.5">
            <BigValue>{project.ai.prompts}</BigValue>
            <MonoLabel>
              prompts · {project.ai.activeUsers} users · ~{project.ai.estimatedHoursSaved}h saved
            </MonoLabel>
          </div>
        </Kpi>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 border-b border-line xl:grid-cols-2">
        <section className="border-b border-line p-6 xl:border-r xl:border-b-0 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <MonoLabel>Progress · planned vs actual</MonoLabel>
            <Definition text="Actual is the weighted milestone roll-up at each period close. Future periods show planned only." />
          </div>
          <ProgressChart data={project.progressSeries} />
        </section>

        <section className="p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <MonoLabel>Budget consumption</MonoLabel>
            <Definition text="The black rule marks the approved budget. The coloured rule marks forecast at completion — red when forecast exceeds approved." />
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
            <MonoLabel>Top risks by exposure</MonoLabel>
          </header>
          {topRisks.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted lg:px-8">No open risks on this project.</p>
          ) : (
            <ul>
              {topRisks.map((risk) => (
                <li key={risk.id} className="border-b border-line px-6 py-4 last:border-b-0 lg:px-8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <MonoLabel>
                        {risk.id} · exposure {riskExposure(risk)} · {risk.owner}
                      </MonoLabel>
                      <p className="text-[14px] leading-snug text-ink">{risk.title}</p>
                      <p className="text-[12px] leading-relaxed text-muted">
                        {risk.mitigation} — {risk.mitigationStatus}
                      </p>
                    </div>
                    <StatusBadge tone={toneForSeverity(risk.severity)}>{risk.severity}</StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <header className="border-b border-line px-6 py-4 lg:px-8">
            <MonoLabel>Open issues</MonoLabel>
          </header>
          {rankedIssues.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted lg:px-8">No open issues on this project.</p>
          ) : (
            <ul>
              {rankedIssues.map((issue) => (
                <li key={issue.id} className="border-b border-line px-6 py-4 last:border-b-0 lg:px-8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <MonoLabel>
                        {issue.id} · {issue.owner} · {issue.ageDays}d old
                      </MonoLabel>
                      <p className="text-[14px] leading-snug text-ink">{issue.title}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge tone={toneForSeverity(issue.severity)}>{issue.severity}</StatusBadge>
                      {issue.overdue && <MonoLabel className="text-warn">Overdue</MonoLabel>}
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

function Timeline({ project }: { project: Project }) {
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
                  <span className="mono-label">weight {m.weight}</span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span className="mono-label">Planned {formatDate(m.plannedDate)}</span>
                  {m.actualDate ? (
                    <span className={cx("mono-label", late ? "text-warn" : "text-ok")}>
                      Actual {formatDate(m.actualDate)}
                    </span>
                  ) : (
                    <span className="mono-label">Not complete</span>
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

function RisksIssues({ project }: { project: Project }) {
  return (
    <div className="border-t border-line">
      <section>
        <header className="border-b border-line px-6 py-4 lg:px-8">
          <MonoLabel>Risk register</MonoLabel>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["ID", "Risk", "Severity", "P × I", "Owner", "Mitigation"].map((h) => (
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
                    No open risks.
                  </td>
                </tr>
              )}
              {project.risks.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="mono-label px-6 py-4 lg:px-8">{r.id}</td>
                  <td className="px-6 py-4 text-[14px] text-ink lg:px-8">{r.title}</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={toneForSeverity(r.severity)}>{r.severity}</StatusBadge>
                  </td>
                  <td className="tnum px-6 py-4 text-[13px] text-ink lg:px-8">
                    {r.probability} × {r.impact} = {riskExposure(r)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">{r.owner}</td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">
                    {r.mitigation}
                    <span className="mono-label mt-1 block">{r.mitigationStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <header className="border-y border-line px-6 py-4 lg:px-8">
          <MonoLabel>Issue register</MonoLabel>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["ID", "Issue", "Severity", "Owner", "Age", "State"].map((h) => (
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
                    No open issues.
                  </td>
                </tr>
              )}
              {project.issues.map((i) => (
                <tr key={i.id} className="border-b border-line">
                  <td className="mono-label px-6 py-4 lg:px-8">{i.id}</td>
                  <td className="px-6 py-4 text-[14px] text-ink lg:px-8">{i.title}</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={toneForSeverity(i.severity)}>{i.severity}</StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-muted lg:px-8">{i.owner}</td>
                  <td className="tnum px-6 py-4 text-[13px] text-muted lg:px-8">{i.ageDays}d</td>
                  <td className="px-6 py-4 lg:px-8">
                    <StatusBadge tone={i.overdue ? "warn" : "ok"}>{i.overdue ? "Overdue" : "On time"}</StatusBadge>
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

function Vendor({ project }: { project: Project }) {
  const v = project.vendor;
  if (!v) {
    return (
      <div className="border-t border-line px-6 py-16 text-center lg:px-8">
        <MonoLabel className="mb-3">No vendor</MonoLabel>
        <p className="text-[15px] text-muted">This project has no vendor attached.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-line">
      <div className="grid grid-cols-1 border-b border-line [&>*]:border-b [&>*]:border-line sm:grid-cols-2 [&>*]:sm:border-r lg:grid-cols-4">
        <Kpi label="Vendor" definition="Vendor of record for this project's contracted scope.">
          <div className="space-y-2.5">
            <div className="text-[19px] leading-tight text-ink">{v.name}</div>
            <StatusBadge tone={toneForHealth(v.health)}>{v.health}</StatusBadge>
          </div>
        </Kpi>
        <Kpi label="Contract milestones" definition="Contractual milestones marked complete by the project lead.">
          <BigValue>
            {v.milestonesComplete}/{v.milestonesTotal}
          </BigValue>
        </Kpi>
        <Kpi label="Open actions" definition="Vendor actions awaiting response or delivery.">
          <BigValue tone={v.openActions > 2 ? "warn" : undefined}>{v.openActions}</BigValue>
        </Kpi>
        <Kpi label="Last update" definition="Date of the most recent vendor status update recorded against this project.">
          <div className="tnum text-[19px] text-ink">{formatDate(v.lastUpdate)}</div>
          <MonoLabel className="mt-2">{v.contact}</MonoLabel>
        </Kpi>
      </div>

      <section className="p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-2">
          <MonoLabel>Scorecard</MonoLabel>
          <Definition text="Rolling 90-day scores out of 100, recorded by the project lead at each vendor review." />
        </div>
        <dl className="max-w-xl space-y-4">
          {[
            { label: "Delivery", value: v.delivery },
            { label: "Quality", value: v.quality },
            { label: "Responsiveness", value: v.responsiveness },
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

function Benefits({ project }: { project: Project }) {
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
    display: m.status === "available" ? fmt(m.value) : "Data unavailable",
  });

  return (
    <div className="grid grid-cols-1 border-t border-line xl:grid-cols-2">
      <section className="border-b border-line p-6 xl:border-r xl:border-b-0 lg:p-8">
        <div className="mb-2 flex items-center gap-2">
          <MonoLabel>HC saving</MonoLabel>
          <Definition text="Headcount saving in FTE. Validated requires a manager-approved time study; realized requires post-implementation measurement." />
        </div>
        <p className="mb-6 text-[12px] text-muted">{b.measurementPeriod}</p>
        <BenefitBars
          rows={[
            row("Planned", b.plannedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
            row("Validated", b.validatedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
            row("Realized", b.realizedFte, fteMax, (n) => `${formatNumber(n)} FTE`),
          ]}
        />
      </section>

      <section className="p-6 lg:p-8">
        <div className="mb-2 flex items-center gap-2">
          <MonoLabel>Energy saving</MonoLabel>
          <Definition text="Annualized kWh saving. Requires baseline, post-implementation value, measurement period, conversion factors and evidence." />
        </div>
        <p className="mb-6 text-[12px] text-muted">{b.measurementPeriod}</p>
        <BenefitBars
          rows={[
            row("Planned", b.plannedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
            row("Validated", b.validatedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
            row("Realized", b.realizedKwh, kwhMax, (n) => `${formatNumber(n, { maximumFractionDigits: 0 })} kWh`),
          ]}
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------- Experience */

function Experience({ project }: { project: Project }) {
  const sections = [
    { label: "Context", body: `${project.name} · ${project.area} · stage ${project.stage} · lead ${project.lead.name}` },
    { label: "Goal and delivered outcome", body: "Not yet captured." },
    { label: "What worked well", body: "Not yet captured." },
    { label: "Issue / failure and root cause", body: "Not yet captured." },
    { label: "Countermeasure and recommendation", body: "Not yet captured." },
    { label: "Reusable artifacts and evidence", body: "Not yet captured." },
  ];

  return (
    <div className="border-t border-line">
      <div className="border-b border-line bg-accent-wash px-6 py-4 lg:px-8">
        <div className="flex items-start gap-3">
          <span aria-hidden className="mt-0.5 text-accent">
            +
          </span>
          <p className="text-[13px] leading-relaxed text-text">
            Jason can draft this report from the project record, milestones and meeting log. It will never
            submit on your behalf — you review and confirm every field before it is saved.
          </p>
        </div>
      </div>
      <dl>
        {sections.map((s) => (
          <div key={s.label} className="border-b border-line px-6 py-5 lg:px-8">
            <MonoLabel>{s.label}</MonoLabel>
            <dd
              className={cx(
                "mt-2 text-[14px] leading-relaxed",
                s.body === "Not yet captured." ? "text-faint" : "text-text",
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
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <>
      <div role="tablist" aria-label="Project sections" className="flex overflow-x-auto border-b border-line px-5 lg:px-8">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "shrink-0 border-b-2 px-4 py-3.5 text-[13px] transition-colors duration-200 first:pl-0",
              tab === t
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rise" key={tab}>
        {tab === "Overview" && <Overview project={project} />}
        {tab === "Timeline" && <Timeline project={project} />}
        {tab === "Risks & issues" && <RisksIssues project={project} />}
        {tab === "Vendor" && <Vendor project={project} />}
        {tab === "Benefits" && <Benefits project={project} />}
        {tab === "Experience" && <Experience project={project} />}
      </div>
    </>
  );
}
