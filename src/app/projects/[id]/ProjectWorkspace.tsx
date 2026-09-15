"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { Button, MonoLabel, StatusBadge, toneForHealth } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { buildingLabel, formatDate, formatTimestamp } from "@/lib/metrics";
import { deleteProject, useProject } from "@/lib/project-store";
import { ProjectTabs } from "./ProjectTabs";

export function ProjectWorkspace({ id }: { id: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const tp = t.project;
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
          <MonoLabel className="mb-3">{tp.deletedLabel}</MonoLabel>
          <p className="mx-auto max-w-md text-[15px] text-muted">{tp.deletedDescription}</p>
        </div>
      );
    }
    return (
      <div className="px-5 py-20 text-center lg:px-8">
        <MonoLabel className="mb-3">{tp.notFoundLabel}</MonoLabel>
        <p className="mx-auto max-w-md text-[15px] text-muted">{tp.notFoundDescription(id)}</p>
        <Link
          href="/portfolio"
          className="mt-6 inline-flex items-center rounded-[2px] bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          {tp.goToPortfolio}
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        label={`${t.enum.projectType[project.type]} · ${project.id}`}
        title={project.name}
        actions={
          <>
            <StatusBadge tone={toneForHealth(project.health)}>{t.enum.health[project.health]}</StatusBadge>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              {tp.deleteProject}
            </Button>
          </>
        }
        meta={
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { term: tp.metaBuildingArea, value: `${buildingLabel(project)} · ${project.area}` },
              { term: tp.metaStage, value: t.enum.stage[project.stage] },
              { term: tp.metaLead, value: project.lead.name },
              { term: tp.metaStart, value: formatDate(project.startDate) },
              { term: tp.metaTargetFinish, value: formatDate(project.targetFinishDate) },
            ].map((item) => (
              <div key={item.term} className="space-y-1.5">
                <MonoLabel>{item.term}</MonoLabel>
                <dd className="text-[14px] text-ink">{item.value}</dd>
              </div>
            ))}
            <div className="space-y-1.5">
              <MonoLabel>{tp.metaDataAsOf}</MonoLabel>
              <dd className="tnum text-[14px] text-muted">{formatTimestamp(project.lastUpdated)}</dd>
            </div>
          </dl>
        }
      />
      <ProjectTabs project={project} />

      <ConfirmDialog
        open={confirmOpen}
        label={tp.deleteDialogLabel}
        title={tp.deleteDialogTitle(project.id)}
        description={tp.deleteDialogDescription(project.name)}
        confirmLabel={tp.deleteProject}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
