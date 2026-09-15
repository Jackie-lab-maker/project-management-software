import { projects } from "@/lib/mock-data";
import { ProjectWorkspace } from "./ProjectWorkspace";

// Pre-renders the shell for every seed project. Projects created client-side
// through the New Project form are not known at build time; Next renders
// those on demand (dynamicParams defaults to true) and ProjectWorkspace
// resolves them from the client-side project store.
export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectWorkspace id={id} />;
}
