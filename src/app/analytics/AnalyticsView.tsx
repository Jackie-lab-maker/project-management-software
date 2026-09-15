"use client";

import { PageHeader } from "@/components/shell/AppShell";
import { StageDistribution } from "@/components/ui/charts";
import { GridRow, IndexMark, MonoLabel, Panel, StatusBadge, cx } from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { knowledge } from "@/lib/mock-data";
import { formatCurrency, formatNumber, scheduleVariance } from "@/lib/metrics";
import { useProjects } from "@/lib/project-store";

export function AnalyticsView() {
  const { t } = useLanguage();
  const ta = t.analytics;
  const projects = useProjects();
  const active = projects.filter((p) => p.stage !== "Cancelled");

  const stageCounts = new Map<string, number>();
  active.forEach((p) => stageCounts.set(p.stage, (stageCounts.get(p.stage) ?? 0) + 1));
  const distribution = [...stageCounts].map(([label, count]) => ({
    label: t.enum.stage[label as keyof typeof t.enum.stage],
    count,
  }));

  const totalApproved = active.reduce((s, p) => s + p.budget.approved, 0);
  const totalForecast = active.reduce((s, p) => s + p.budget.forecastAtCompletion, 0);
  const behind = active.filter((p) => scheduleVariance(p) < 0);
  const realizedFte = active.reduce(
    (s, p) => s + (p.benefit.realizedFte.status === "available" ? p.benefit.realizedFte.value : 0),
    0,
  );
  const approvedKnowledge = knowledge.filter((k) => k.state === "Approved").length;
  const coverage = Math.round((approvedKnowledge / knowledge.length) * 100);
  const maxVariance = Math.max(...active.map((p) => Math.abs(scheduleVariance(p))), 0);

  return (
    <>
      <PageHeader label={ta.pageLabel} title={ta.title} description={ta.description} />

      <GridRow cols={4}>
        {[
          {
            value: String(active.length),
            label: ta.activeProjectsLabel,
            note: ta.activeProjectsNote,
          },
          {
            value: `${behind.length}`,
            label: ta.behindPlanLabel,
            note: ta.behindPlanNote,
          },
          {
            value: formatCurrency(totalApproved, "USD", true),
            label: ta.approvedCapitalLabel,
            note: ta.approvedCapitalNote(formatCurrency(totalForecast, "USD", true)),
          },
          {
            value: `${formatNumber(realizedFte)} FTE`,
            label: ta.realizedHcLabel,
            note: ta.realizedHcNote,
          },
        ].map((stat, i) => (
          <div key={stat.label} className="p-6 lg:p-7">
            <IndexMark n={i + 1} />
            <div className="tnum mt-4 text-[32px] leading-none font-medium tracking-[-0.03em] text-ink">
              {stat.value}
            </div>
            <div className="mono-label mt-3 text-accent">{stat.label}</div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{stat.note}</p>
          </div>
        ))}
      </GridRow>

      <div className="grid grid-cols-1 border-b border-line xl:grid-cols-2">
        <section className="border-b border-line p-6 xl:border-r xl:border-b-0 lg:p-8">
          <MonoLabel className="mb-6">{ta.stageDistribution}</MonoLabel>
          <StageDistribution segments={distribution} />
        </section>

        <section className="p-6 lg:p-8">
          <MonoLabel className="mb-6">{ta.scheduleVarianceByProject}</MonoLabel>
          <ul className="space-y-4">
            {active.map((p) => {
              const v = scheduleVariance(p);
              // Scale to the widest variance present so bars stay comparable
              // instead of saturating at a fixed cap.
              const width = maxVariance === 0 ? 0 : (Math.abs(v) / maxVariance) * 50;
              return (
                <li key={p.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[13px] text-ink">{p.name}</span>
                    <span className={cx("tnum shrink-0 text-[13px]", v < 0 ? "text-warn" : "text-ok")}>
                      {v > 0 ? "+" : ""}
                      {v}%
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full bg-sunken">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-line" aria-hidden />
                    <div
                      className={cx("absolute inset-y-0", v < 0 ? "bg-warn" : "bg-ok")}
                      style={
                        v < 0
                          ? { right: "50%", width: `${width}%` }
                          : { left: "50%", width: `${width}%` }
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <Panel label={ta.knowledgeHealth} title={ta.approvalReviewCoverage} className="border-x-0 border-t-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 [&>*]:border-b [&>*]:border-line [&>*]:sm:border-r [&>*]:sm:border-b-0 [&>*:last-child]:sm:border-r-0">
          <div className="space-y-2 p-6">
            <MonoLabel>{ta.approvedCoverage}</MonoLabel>
            <div className="tnum text-[28px] leading-none font-medium text-ink">{coverage}%</div>
            <p className="text-[12px] leading-relaxed text-muted">{ta.approvedCoverageNote(approvedKnowledge, knowledge.length)}</p>
          </div>
          <div className="space-y-2 p-6">
            <MonoLabel>{ta.awaitingReview}</MonoLabel>
            <div className="tnum text-[28px] leading-none font-medium text-warn">
              {knowledge.filter((k) => k.state === "In Review").length}
            </div>
            <p className="text-[12px] leading-relaxed text-muted">{ta.awaitingReviewNote}</p>
          </div>
          <div className="space-y-2 p-6">
            <MonoLabel>{ta.reuseSignal}</MonoLabel>
            <div className="flex items-baseline gap-2">
              <StatusBadge tone="ok">{ta.reuseSignalHealthy}</StatusBadge>
            </div>
            <p className="text-[12px] leading-relaxed text-muted">{ta.reuseSignalNote}</p>
          </div>
        </div>
      </Panel>
    </>
  );
}
