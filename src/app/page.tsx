"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/AppShell";
import {
  ArrowLink,
  ButtonLink,
  GridRow,
  IndexMark,
  MonoLabel,
  Panel,
  StatusBadge,
  toneForHealth,
  toneForSeverity,
} from "@/components/ui/primitives";
import { currentUser, knowledge } from "@/lib/mock-data";
import {
  buildingLabel,
  daysUntil,
  formatDate,
  formatTimestamp,
  weightedProgress,
} from "@/lib/metrics";
import { useProjects } from "@/lib/project-store";

function StatCell({
  index,
  value,
  label,
  note,
  href,
}: {
  index: number;
  value: string;
  label: string;
  note: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block p-6 transition-colors duration-200 hover:bg-surface-hover lg:p-7">
      <IndexMark n={index} />
      <div className="tnum mt-4 text-[38px] leading-none font-medium tracking-[-0.03em] text-ink">
        {value}
      </div>
      <div className="mono-label mt-3 text-accent">{label}</div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{note}</p>
    </Link>
  );
}

export default function HomePage() {
  const projects = useProjects();
  const active = projects.filter((p) => p.stage !== "Closed" && p.stage !== "Cancelled");
  const mine = active.filter((p) => p.lead.id === currentUser.id);
  const atRisk = active.filter((p) => p.health === "At Risk" || p.health === "Off Track");
  const overdueIssues = active.flatMap((p) =>
    p.issues.filter((i) => i.overdue).map((i) => ({ ...i, project: p })),
  );
  const reviewSoon = knowledge.filter((k) => daysUntil(k.reviewDate) < 210);

  return (
    <>
      <PageHeader
        label="Home"
        title={`Good morning, ${currentUser.name.split(" ")[0]}.`}
        description="Your assigned work, the projects that need attention today, and what Jason found overnight."
        actions={
          <>
            <ButtonLink href="/projects/new">New project</ButtonLink>
            <ButtonLink href="/portfolio" variant="secondary">
              View portfolio
            </ButtonLink>
          </>
        }
      />

      <GridRow cols={4}>
        <StatCell
          index={1}
          value={String(mine.length)}
          label="Projects you lead"
          note="Active across all stages, excluding closed and cancelled."
          href="/portfolio"
        />
        <StatCell
          index={2}
          value={String(atRisk.length)}
          label="Need attention"
          note="At Risk or Off Track under the current health rules."
          href="/portfolio"
        />
        <StatCell
          index={3}
          value={String(overdueIssues.length)}
          label="Overdue actions"
          note="Issues past their owner action date across your projects."
          href="/portfolio"
        />
        <StatCell
          index={4}
          value={String(reviewSoon.length)}
          label="Knowledge due review"
          note="Approved documents approaching their scheduled review date."
          href="/knowledge"
        />
      </GridRow>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr]">
        {/* Projects needing attention */}
        <section className="border-b border-line xl:border-r">
          <header className="flex items-end justify-between gap-4 px-5 py-6 lg:px-8">
            <div className="space-y-2">
              <MonoLabel>Attention required</MonoLabel>
              <h2 className="text-[24px] leading-tight">Projects off plan</h2>
            </div>
            <ArrowLink href="/portfolio">All projects</ArrowLink>
          </header>

          <ul className="border-t border-line">
            {atRisk.map((project) => {
              const progress = weightedProgress(project);
              const critical = project.risks.filter((r) => r.severity === "Critical").length;
              const overdue = project.issues.filter((i) => i.overdue).length;
              return (
                <li key={project.id} className="border-b border-line">
                  <Link
                    href={`/projects/${project.id}`}
                    className="block px-5 py-5 transition-colors duration-200 hover:bg-surface-hover lg:px-8"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <MonoLabel>
                          {project.id} · {buildingLabel(project)} · {project.area}
                        </MonoLabel>
                        <h3 className="text-[17px] leading-snug">{project.name}</h3>
                      </div>
                      <StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="flex items-baseline gap-2">
                        <MonoLabel>Progress</MonoLabel>
                        <span className="tnum text-sm text-ink">{progress}%</span>
                      </span>
                      {critical > 0 && (
                        <span className="flex items-baseline gap-2">
                          <MonoLabel>Critical risks</MonoLabel>
                          <span className="tnum text-sm text-risk">{critical}</span>
                        </span>
                      )}
                      {overdue > 0 && (
                        <span className="flex items-baseline gap-2">
                          <MonoLabel>Overdue</MonoLabel>
                          <span className="tnum text-sm text-warn">{overdue}</span>
                        </span>
                      )}
                      <span className="flex items-baseline gap-2">
                        <MonoLabel>Target</MonoLabel>
                        <span className="tnum text-sm text-muted">
                          {formatDate(project.targetFinishDate)}
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Jason insights + knowledge */}
        <div className="flex flex-col">
          <section className="border-b border-line">
            <header className="space-y-2 px-5 py-6 lg:px-8">
              <MonoLabel tone="accent">Jason insights</MonoLabel>
              <h2 className="text-[24px] leading-tight">Overnight findings</h2>
            </header>
            <ul className="border-t border-line">
              {[
                {
                  text: "PRJ202609001 matches the 2025 B3 rail alignment failure pattern. The lesson recommends a receiving inspection gate that is not in the current milestone plan.",
                  source: "K-0987 · Rev 2",
                },
                {
                  text: "Vendor responsiveness for Daifuku dropped to 64 over the last 30 days, the lowest of any active vendor.",
                  source: "Vendor scorecard · 2026-09-12",
                },
                {
                  text: "Two approved SOPs referenced by active projects reach their review date within 90 days.",
                  source: "Knowledge register",
                },
              ].map((insight, i) => (
                <li key={i} className="border-b border-line px-5 py-4 lg:px-8">
                  <div className="flex gap-3">
                    <span aria-hidden className="mt-1.5 text-accent">
                      +
                    </span>
                    <div className="space-y-2">
                      <p className="text-[13px] leading-relaxed text-text">{insight.text}</p>
                      <MonoLabel>{insight.source}</MonoLabel>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <Panel
            label="Knowledge"
            title="Recently updated"
            className="flex-1 border-x-0 border-b border-t-0"
            action={<ArrowLink href="/knowledge">Hub</ArrowLink>}
          >
            <ul>
              {knowledge.slice(0, 4).map((item) => (
                <li key={item.id} className="border-b border-line px-5 py-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <MonoLabel>
                        {item.category} · {item.revision}
                      </MonoLabel>
                      <h3 className="truncate text-[14px] leading-snug">{item.title}</h3>
                    </div>
                    <StatusBadge tone={item.state === "Approved" ? "ok" : "none"}>
                      {item.state}
                    </StatusBadge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Overdue actions */}
      <section className="border-b border-line">
        <header className="flex items-end justify-between gap-4 px-5 py-6 lg:px-8">
          <div className="space-y-2">
            <MonoLabel>Your queue</MonoLabel>
            <h2 className="text-[24px] leading-tight">Overdue actions</h2>
          </div>
          <MonoLabel>Updated {formatTimestamp(new Date().toISOString())}</MonoLabel>
        </header>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["Issue", "Project", "Severity", "Owner", "Age"].map((h) => (
                  <th key={h} scope="col" className="mono-label px-5 py-3 font-normal lg:px-8">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overdueIssues.map((issue) => (
                <tr key={issue.id} className="border-b border-line transition-colors hover:bg-surface-hover">
                  <td className="px-5 py-4 text-[14px] text-ink lg:px-8">
                    <span className="mono-label mr-2 text-faint">{issue.id}</span>
                    {issue.title}
                  </td>
                  <td className="px-5 py-4 lg:px-8">
                    <Link
                      href={`/projects/${issue.project.id}`}
                      className="font-mono text-[11px] text-accent hover:text-accent-hover"
                    >
                      {issue.project.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4 lg:px-8">
                    <StatusBadge tone={toneForSeverity(issue.severity)}>{issue.severity}</StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-muted lg:px-8">{issue.owner}</td>
                  <td className="tnum px-5 py-4 text-[13px] text-warn lg:px-8">{issue.ageDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
