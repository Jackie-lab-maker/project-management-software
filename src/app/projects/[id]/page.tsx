import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/AppShell";
import { MonoLabel, StatusBadge, toneForHealth } from "@/components/ui/primitives";
import { projects } from "@/lib/mock-data";
import { buildingLabel, formatDate, formatTimestamp } from "@/lib/metrics";
import { ProjectTabs } from "./ProjectTabs";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

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
