"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { Button, MonoLabel, StatusBadge, toneForHealth } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { buildingLabel, formatDate, formatTimestamp } from "@/lib/metrics";
import { deleteProject, useProject } from "@/lib/project-store";
import { ProjectTabs } from "./ProjectTabs";

export function ProjectWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const project = useProject(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // A project created client-side (stored in localStorage) is absent from
  // the server-rendered snapshot, so the very first client render would
  // otherwise flash "not found" before useSyncExternalStore reconciles
  // against localStorage. Hold that render until after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleDelete = () => {
    setConfirmOpen(false);
    setDeleting(true);
    deleteProject(id);
    router.push("/portfolio");
  };

  if (!project) {
    if (!mounted) return null;
    if (deleting) {
      return (
        <div className="px-5 py-20 text-center lg:px-8">
          <MonoLabel className="mb-3">Project deleted</MonoLabel>
          <p className="mx-auto max-w-md text-[15px] text-muted">Returning to the portfolio…</p>
        </div>
      );
    }
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
        actions={
          <>
            <StatusBadge tone={toneForHealth(project.health)}>{project.health}</StatusBadge>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete project
            </Button>
          </>
        }
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

      <ConfirmDialog
        open={confirmOpen}
        label="Delete project"
        title={`Delete ${project.id}?`}
        description={`This removes "${project.name}" and its risks, issues, milestones and benefit data from your view in this browser. This cannot be undone.`}
        confirmLabel="Delete project"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
