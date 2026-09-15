"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StageDistribution } from "@/components/ui/charts";
import {
  MonoLabel,
  StatusBadge,
  cx,
  toneForHealth,
} from "@/components/ui/primitives";
import {
  buildingLabel,
  formatCurrency,
  formatDate,
  plannedProgress,
  scheduleVariance,
  weightedProgress,
} from "@/lib/metrics";
import type { Project, Stage } from "@/lib/types";

const STAGES: Stage[] = [
  "Draft",
  "Planned",
  "In Progress",
  "FAT",
  "SAT",
  "Buy-off",
  "Closed",
  "On Hold",
  "Cancelled",
];

type View = "table" | "cards" | "timeline";

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="mono-label block">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-bg px-2.5 py-1.5 text-[13px] text-text focus:border-ink focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgressTrack({ project }: { project: Project }) {
  const actual = weightedProgress(project);
  const planned = plannedProgress(project);
  return (
    <div className="space-y-1.5">
      <div className="relative h-1.5 w-full bg-sunken">
        <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${actual}%` }} />
        <div
          className="absolute -top-0.5 -bottom-0.5 w-px bg-ink"
          style={{ left: `${planned}%` }}
          aria-hidden
          title={`Planned ${planned}%`}
        />
      </div>
      <div className="flex justify-between">
        <span className="tnum text-[12px] text-ink">{actual}%</span>
        <span className="tnum text-[12px] text-faint">plan {planned}%</span>
      </div>
    </div>
  );
}

export function PortfolioBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [building, setBuilding] = useState("");
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [view, setView] = useState<View>("table");

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const haystack = `${p.id} ${p.name} ${p.area} ${p.lead.name}`.toLowerCase();
        if (query && !haystack.includes(query.toLowerCase())) return false;
        if (building && buildingLabel(p) !== building) return false;
        if (type && p.type !== type) return false;
        if (stage && p.stage !== stage) return false;
        return true;
      }),
    [projects, query, building, type, stage],
  );

  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((p) => counts.set(p.stage, (counts.get(p.stage) ?? 0) + 1));
    return STAGES.filter((s) => counts.has(s)).map((s) => ({ label: s, count: counts.get(s) ?? 0 }));
  }, [filtered]);

  const buildings = [...new Set(projects.map(buildingLabel))];

  return (
    <>
      {/* Controls */}
      <div className="grid grid-cols-1 border-b border-line lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 border-b border-line p-5 lg:border-b-0 lg:border-r lg:p-8">
          <div className="space-y-1.5">
            <label htmlFor="portfolio-search" className="mono-label block">
              Search
            </label>
            <input
              id="portfolio-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Project name, ID, area, or lead…"
              className="w-full border border-line bg-bg px-3 py-2 text-sm text-text placeholder:text-faint focus:border-ink focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FilterSelect label="Building" value={building} options={buildings} onChange={setBuilding} />
            <FilterSelect label="Type" value={type} options={["New Project", "CIP"]} onChange={setType} />
            <FilterSelect label="Stage" value={stage} options={STAGES} onChange={setStage} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <MonoLabel>
              {filtered.length} of {projects.length} projects
            </MonoLabel>
            <div role="tablist" aria-label="View" className="flex border border-line">
              {(["table", "cards", "timeline"] as View[]).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={cx(
                    "px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-200",
                    view === v ? "bg-ink text-bg" : "text-muted hover:bg-surface-hover hover:text-ink",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 lg:p-8">
          <MonoLabel>Stage distribution</MonoLabel>
          {distribution.length > 0 ? (
            <StageDistribution segments={distribution} />
          ) : (
            <p className="text-sm text-muted">Data unavailable for the current filters.</p>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="px-5 py-20 text-center lg:px-8">
          <MonoLabel className="mb-3">No matches</MonoLabel>
          <p className="text-[15px] text-muted">
            No project matches these filters. Clear a filter or widen the search.
          </p>
        </div>
      )}

      {view === "table" && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["Project", "Building / Area", "Type", "Stage", "Health", "Lead", "Progress", "Target", "Budget"].map(
                  (h) => (
                    <th key={h} scope="col" className="mono-label px-5 py-3 font-normal first:pl-5 lg:first:pl-8">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="group border-b border-line transition-colors hover:bg-surface-hover">
                  <td className="px-5 py-4 lg:pl-8">
                    <Link href={`/projects/${project.id}`} className="block space-y-1">
                      <span className="mono-label text-accent">{project.id}</span>
                      <span className="block text-[14px] leading-snug text-ink">{project.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-muted">
                    {buildingLabel(project)} · {project.area}
                  </td>
                  <td className="px-5 py-4">
                    <span className="mono-label">{project.type}</span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink">{project.stage}</td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-muted">{project.lead.name}</td>
                  <td className="w-36 px-5 py-4">
                    <ProgressTrack project={project} />
                  </td>
                  <td className="tnum px-5 py-4 text-[13px] text-muted">
                    {formatDate(project.targetFinishDate)}
                  </td>
                  <td className="tnum px-5 py-4 text-[13px] text-ink">
                    {formatCurrency(project.budget.approved, project.budget.currency, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "cards" && filtered.length > 0 && (
        <div className="grid grid-cols-1 border-t border-line [&>*]:border-b [&>*]:border-line sm:grid-cols-2 [&>*]:sm:border-r xl:grid-cols-3">
          {filtered.map((project) => {
            const variance = scheduleVariance(project);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group block space-y-5 p-6 transition-colors duration-200 hover:bg-surface-hover lg:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <MonoLabel tone="accent">{project.id}</MonoLabel>
                  <StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[19px] leading-snug">{project.name}</h3>
                  <MonoLabel>
                    {buildingLabel(project)} · {project.area} · {project.type}
                  </MonoLabel>
                </div>

                <ProgressTrack project={project} />

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
                  <div className="space-y-1">
                    <MonoLabel>Stage</MonoLabel>
                    <dd className="text-[13px] text-ink">{project.stage}</dd>
                  </div>
                  <div className="space-y-1">
                    <MonoLabel>Schedule</MonoLabel>
                    <dd
                      className={cx(
                        "tnum text-[13px]",
                        variance < 0 ? "text-warn" : "text-ok",
                      )}
                    >
                      {variance > 0 ? "+" : ""}
                      {variance}%
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <MonoLabel>Lead</MonoLabel>
                    <dd className="text-[13px] text-muted">{project.lead.name}</dd>
                  </div>
                  <div className="space-y-1">
                    <MonoLabel>Target</MonoLabel>
                    <dd className="tnum text-[13px] text-muted">{formatDate(project.targetFinishDate)}</dd>
                  </div>
                </dl>
              </Link>
            );
          })}
        </div>
      )}

      {view === "timeline" && filtered.length > 0 && <Timeline projects={filtered} />}
    </>
  );
}

function Timeline({ projects }: { projects: Project[] }) {
  const dates = projects.flatMap((p) => [new Date(p.startDate), new Date(p.targetFinishDate)]);
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  const span = max.getTime() - min.getTime() || 1;
  const pos = (d: string) => ((new Date(d).getTime() - min.getTime()) / span) * 100;

  const months: { label: string; left: number }[] = [];
  const cursor = new Date(min.getFullYear(), min.getMonth(), 1);
  while (cursor <= max) {
    months.push({
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      left: ((cursor.getTime() - min.getTime()) / span) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="overflow-x-auto border-t border-line">
      <div className="min-w-[860px]">
        <div className="relative h-8 border-b border-line">
          {months.map((m) => (
            <div
              key={`${m.label}-${m.left}`}
              className="absolute top-0 h-full border-l border-line pl-2"
              style={{ left: `${Math.max(m.left, 0)}%` }}
            >
              <span className="mono-label leading-8">{m.label}</span>
            </div>
          ))}
        </div>

        <ul>
          {projects.map((project) => {
            const left = pos(project.startDate);
            const right = pos(project.targetFinishDate);
            const tone = toneForHealth(project.health);
            const barColor = {
              ok: "bg-ok",
              warn: "bg-warn",
              risk: "bg-risk",
              none: "bg-none",
            }[tone];
            return (
              <li key={project.id} className="border-b border-line">
                <Link
                  href={`/projects/${project.id}`}
                  className="relative block h-16 transition-colors duration-200 hover:bg-surface-hover"
                >
                  <div
                    className="absolute top-1/2 flex h-7 -translate-y-1/2 items-center gap-2 px-2"
                    style={{ left: `${left}%`, width: `${Math.max(right - left, 4)}%` }}
                  >
                    <div className={cx("absolute inset-0 opacity-15", barColor)} />
                    <div className={cx("absolute inset-y-0 left-0 w-0.5", barColor)} />
                    <span className="relative truncate text-[12px] text-ink">{project.name}</span>
                  </div>
                  <span className="mono-label absolute top-2 left-2">{project.id}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
