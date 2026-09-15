"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { MonoLabel, StatusBadge, toneForHealth } from "@/components/ui/primitives";
import { buildingLabel, formatDate, formatTimestamp } from "@/lib/metrics";
import { useProject } from "@/lib/project-store";
import { ProjectTabs } from "./ProjectTabs";

export function ProjectWorkspace({ id }: { id: string }) {
  const project = useProject(id);

  // A project created client-side (stored in localStorage) is absent from
  // the server-rendered snapshot, so the very first client render would
  // otherwise flash "not found" before useSyncExternalStore reconciles
  // against localStorage. Hold that render until after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!project) {
    if (!mounted) return null;
    return (
      <div className="px-5 py-20 text-center lg:px-8">
        <MonoLabel className="mb-3">Not found</MonoLabel>
        <p className="mx-auto max-w-md text-[15px] text-muted">
          No project matches {id}. It may not exist, or you may not have permission to view it.
        </p>
        <Link
          href="/portfolio"
          className="mt-6 inline-flex items-center rounded-[2px] bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          Go to portfolio
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        label={`${project.type} · ${project.id}`}
        title={project.name}
        actions={<StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>}
        meta={
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { term: "Building / Area", value: `${buildingLabel(project)} · ${project.area}` },
              { term: "Stage", value: project.stage },
              { term: "Lead", value: project.lead.name },
              { term: "Start", value: formatDate(project.startDate) },
              { term: "Target finish", value: formatDate(project.targetFinishDate) },
            ].map((item) => (
              <div key={item.term} className="space-y-1.5">
                <MonoLabel>{item.term}</MonoLabel>
                <dd className="text-[14px] text-ink">{item.value}</dd>
              </div>
            ))}
            <div className="space-y-1.5">
              <MonoLabel>Data as of</MonoLabel>
              <dd className="tnum text-[14px] text-muted">{formatTimestamp(project.lastUpdated)}</dd>
            </div>
          </dl>
        }
      />
      <ProjectTabs project={project} />
    </>
  );
}
