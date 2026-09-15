import { PageHeader } from "@/components/shell/AppShell";
import { NewProjectForm } from "./NewProjectForm";

export const metadata = { title: "New project · Digital Brain" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        label="Create"
        title="New project"
        description="The project ID is generated server-side at creation and never changes, even if the type or dates are edited later."
      />
      <NewProjectForm />
    </>
  );
}
