import { PageHeader } from "@/components/shell/AppShell";
import { knowledge } from "@/lib/mock-data";
import { KnowledgeBrowser } from "./KnowledgeBrowser";

export const metadata = { title: "Knowledge hub · Digital Brain" };

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        label="Knowledge"
        title="Knowledge hub"
        description="Governed engineering knowledge. Only approved revisions are used as trusted Jason context; drafts and in-review items are visible but excluded from retrieval."
      />
      <KnowledgeBrowser items={knowledge} />
    </>
  );
}
