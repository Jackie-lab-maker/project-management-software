"use client";

import { PageHeader } from "@/components/shell/AppShell";
import { MonoLabel, Panel, StatusBadge } from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { users } from "@/lib/mock-data";
import type { Role } from "@/lib/types";

const ROLES: Role[] = ["System Admin", "Project Lead", "Engineer", "Technician", "Manager", "Visitor"];

// actor/target/at are audit-log data (who, what, when) and stay as recorded;
// action and outcome are UI copy describing them, translated via t.admin.
const AUDIT = [
  { actor: "Mei Tan", target: "PRJ202609001", outcome: "Success" as const, at: "2026-09-15 08:41 UTC" },
  { actor: "Jason (on behalf of Mei Tan)", target: "PRJ202609001", outcome: "Pending" as const, at: "2026-09-15 08:39 UTC" },
  { actor: "Arun Prakash", target: "K-1188", outcome: "Success" as const, at: "2026-09-14 16:02 UTC" },
  { actor: "Priya Sharma", target: "Sofia Lindqvist", outcome: "Success" as const, at: "2026-09-14 11:20 UTC" },
  { actor: "Visitor session", target: "K-1201", outcome: "Denied" as const, at: "2026-09-13 09:55 UTC" },
];

export function AdminView() {
  const { t } = useLanguage();
  const ta = t.admin;

  return (
    <>
      <PageHeader label={ta.pageLabel} title={ta.title} description={ta.description} />

      <Panel label={ta.accessModel} title={ta.rolesAndPermissions} className="border-x-0 border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  {ta.colRole}
                </th>
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  {ta.colCorePermissions}
                </th>
                <th scope="col" className="mono-label px-5 py-3 font-normal">
                  {ta.colUsers}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4 text-[14px] whitespace-nowrap text-ink">{t.enum.role[role]}</td>
                  <td className="px-5 py-4 text-[13px] leading-relaxed text-muted">{ta.rolePermissions[role]}</td>
                  <td className="tnum px-5 py-4 text-[13px] text-ink">
                    {users.filter((u) => u.role === role).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel label={ta.governance} title={ta.recentAuditEvents} className="border-x-0 border-t-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line">
                {[ta.colActor, ta.colAction, ta.colTarget, ta.colOutcome, ta.colTimestamp].map((h) => (
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
                  <td className="px-5 py-4 text-[13px] text-muted">{ta.auditActions[i]}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-accent">{event.target}</td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      tone={event.outcome === "Success" ? "ok" : event.outcome === "Denied" ? "risk" : "warn"}
                    >
                      {t.enum.auditOutcome[event.outcome]}
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
        <MonoLabel className="mb-3">{ta.auditRetention}</MonoLabel>
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted">{ta.auditRetentionBody}</p>
      </section>
    </>
  );
}
