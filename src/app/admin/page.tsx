import { PageHeader } from "@/components/shell/AppShell";
import { MonoLabel, Panel, StatusBadge } from "@/components/ui/primitives";
import { users } from "@/lib/mock-data";

export const metadata = { title: "Administration · Digital Brain" };

const ROLE_PERMISSIONS: { role: string; permissions: string }[] = [
  { role: "System Admin", permissions: "Configure users, roles, taxonomies, retention, integrations, and all records." },
  { role: "Project Lead", permissions: "Create and manage assigned projects, milestones, team, documents, reports, and Jason actions." },
  { role: "Engineer", permissions: "Contribute to assigned projects; upload, revise and search permitted knowledge; submit lessons learned." },
  { role: "Technician", permissions: "View assigned project information; update assigned tasks; upload field evidence when permitted." },
  { role: "Manager", permissions: "Portfolio visibility, approvals, reporting, and controlled access within their organization." },
  { role: "Visitor", permissions: "Read-only access to specifically shared, approved content." },
];

const AUDIT = [
  { actor: "Mei Tan", action: "Updated milestone M2 actual date", target: "PRJ202609001", outcome: "Success", at: "2026-09-15 08:41 UTC" },
  { actor: "Jason (on behalf of Mei Tan)", action: "Proposed milestone creation — awaiting confirmation", target: "PRJ202609001", outcome: "Pending", at: "2026-09-15 08:39 UTC" },
  { actor: "Arun Prakash", action: "Submitted BKM for review", target: "K-1188", outcome: "Success", at: "2026-09-14 16:02 UTC" },
  { actor: "Priya Sharma", action: "Granted Engineer role", target: "Sofia Lindqvist", outcome: "Success", at: "2026-09-14 11:20 UTC" },
  { actor: "Visitor session", action: "Attempted download of restricted document", target: "K-1201", outcome: "Denied", at: "2026-09-13 09:55 UTC" },
];

export default function AdminPage() {
  return (
    <>
      <PageHeader
        label="Administration"
        title="Users, roles, and audit"
        description="Least-privilege defaults with project- and document-level grants. Every read, write, download, and AI action is recorded."
      />

      <Panel label="Access model" title="Roles and core permissions" className="border-x-0 border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  Role
                </th>
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  Core permissions
                </th>
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  Users
                </th>
              </tr>
            </thead>
            <tbody>
              {ROLE_PERMISSIONS.map((row) => (
                <tr key={row.role} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4 text-[14px] whitespace-nowrap text-ink">{row.role}</td>
                  <td className="px-5 py-4 text-[13px] leading-relaxed text-muted">{row.permissions}</td>
                  <td className="tnum px-5 py-4 text-[13px] text-ink">
                    {users.filter((u) => u.role === row.role).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel label="Governance" title="Recent audit events" className="border-x-0 border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line">
                {["Actor", "Action", "Target", "Outcome", "Timestamp"].map((h) => (
                  <th key={h} scope="col" className="mono-label px-5 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT.map((event, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4 text-[13px] text-ink">{event.actor}</td>
                  <td className="px-5 py-4 text-[13px] text-muted">{event.action}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-accent">{event.target}</td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      tone={event.outcome === "Success" ? "ok" : event.outcome === "Denied" ? "risk" : "warn"}
                    >
                      {event.outcome}
                    </StatusBadge>
                  </td>
                  <td className="tnum px-5 py-4 text-[12px] whitespace-nowrap text-muted">{event.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <section className="border-b border-line px-5 py-8 lg:px-8">
        <MonoLabel className="mb-3">Audit retention</MonoLabel>
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted">
          Audit events are immutable and retained per Micron internal policy. Retention periods, export
          controls, and the list of classifications excluded from AI processing must be confirmed with
          IT, security, and legal before production launch.
        </p>
      </section>
    </>
  );
}
