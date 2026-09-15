import { PageHeader } from "@/components/shell/AppShell";
import { ButtonLink } from "@/components/ui/primitives";
import { projects } from "@/lib/mock-data";
import { PortfolioBrowser } from "./PortfolioBrowser";

export const metadata = { title: "Project portfolio · Digital Brain" };

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        label="Portfolio"
        title="Project portfolio"
        description="Every automation project with its current stage, health, and owner. Filters and views respect your role scope."
        actions={<ButtonLink href="/projects/new">New project</ButtonLink>}
      />
      <PortfolioBrowser projects={projects} />
    </>
  );
}
