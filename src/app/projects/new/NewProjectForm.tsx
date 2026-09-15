"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, MonoLabel, StatusBadge, cx } from "@/components/ui/primitives";
import { eligibleLeads, projects } from "@/lib/mock-data";
import {
  findDuplicate,
  formatProjectId,
  nextSequence,
  validateDraft,
  type FieldErrors,
  type ProjectDraft,
} from "@/lib/project-id";
import { buildingLabel } from "@/lib/metrics";
import type { ProjectType } from "@/lib/types";

const BUILDINGS = ["B1", "B2", "B3", "B5", "Others"] as const;

const EMPTY: ProjectDraft = {
  building: "",
  otherBuildingName: "",
  area: "",
  name: "",
  leadId: "",
  type: "New Project",
  startDate: "",
  targetFinishDate: "",
};

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-center gap-2">
        <span className="mono-label">{label}</span>
        {required && (
          <span className="mono-label text-accent" aria-hidden>
            required
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[12px] leading-relaxed text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-start gap-1.5 text-[12px] leading-relaxed text-risk">
          <span aria-hidden>■</span>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (invalid?: boolean) =>
  cx(
    "w-full border bg-bg px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none",
    invalid ? "border-risk focus:border-risk" : "border-line focus:border-ink",
  );

export function NewProjectForm() {
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (submitted) setErrors(validateDraft({ ...draft, [key]: value }, { eligibleLeadIds: eligibleLeads.map((u) => u.id) }));
  };

  // Preview only. The authoritative sequence comes from a transactional
  // server-side counter at creation time.
  const previewId = useMemo(() => {
    const now = new Date();
    return formatProjectId(
      draft.type,
      now,
      nextSequence(projects.map((p) => p.id), draft.type, now),
    );
  }, [draft.type]);

  const duplicate = useMemo(() => {
    if (!draft.building || !draft.area.trim() || !draft.name.trim()) return undefined;
    return findDuplicate(
      draft,
      projects.map((p) => ({ building: buildingLabel(p), area: p.area, name: p.name, stage: p.stage, id: p.id })),
    );
  }, [draft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateDraft(draft, { eligibleLeadIds: eligibleLeads.map((u) => u.id) });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (duplicate && !duplicateAcknowledged) return;
    setCreated(previewId);
  };

  if (created) {
    return (
      <div className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-lg space-y-6 border border-line p-8 text-center">
          <MonoLabel tone="accent">Project created</MonoLabel>
          <div className="tnum text-[34px] leading-none font-medium tracking-[-0.03em] text-ink">{created}</div>
          <p className="text-[14px] leading-relaxed text-muted">
            {draft.name} has been created in {draft.building === "Others" ? draft.otherBuildingName : draft.building} ·{" "}
            {draft.area}. The ID is immutable and the creation event is recorded in the audit log.
          </p>
          <div className="flex justify-center gap-2.5">
            <Link
              href="/portfolio"
              className="inline-flex items-center rounded-[2px] bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
            >
              Go to portfolio
            </Link>
            <button
              onClick={() => {
                setCreated(null);
                setDraft(EMPTY);
                setSubmitted(false);
                setDuplicateAcknowledged(false);
              }}
              className="inline-flex items-center rounded-[2px] border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-surface-hover"
            >
              Create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
      {/* Fields */}
      <div className="border-b border-line lg:border-r lg:border-b-0">
        <fieldset className="space-y-6 border-b border-line p-6 lg:p-8">
          <legend className="sr-only">Location</legend>
          <MonoLabel>01 · Location</MonoLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Building" htmlFor="building" required error={errors.building}>
              <select
                id="building"
                value={draft.building}
                onChange={(e) => set("building", e.target.value)}
                aria-invalid={!!errors.building}
                className={inputClass(!!errors.building)}
              >
                <option value="">Select a building…</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            {draft.building === "Others" && (
              <Field
                label="Other building name"
                htmlFor="otherBuildingName"
                required
                error={errors.otherBuildingName}
              >
                <input
                  id="otherBuildingName"
                  value={draft.otherBuildingName}
                  onChange={(e) => set("otherBuildingName", e.target.value)}
                  aria-invalid={!!errors.otherBuildingName}
                  className={inputClass(!!errors.otherBuildingName)}
                  placeholder="e.g. Central Utility Building"
                />
              </Field>
            )}

            <Field label="Area" htmlFor="area" required error={errors.area}>
              <input
                id="area"
                value={draft.area}
                onChange={(e) => set("area", e.target.value)}
                aria-invalid={!!errors.area}
                className={inputClass(!!errors.area)}
                placeholder="e.g. Litho Bay 4"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-6 border-b border-line p-6 lg:p-8">
          <legend className="sr-only">Project</legend>
          <MonoLabel>02 · Project</MonoLabel>

          <Field label="Project name" htmlFor="name" required error={errors.name}>
            <input
              id="name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
              className={inputClass(!!errors.name)}
              placeholder="e.g. Litho Bay AMHS Stocker Retrofit"
            />
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field
              label="Project type"
              htmlFor="type"
              required
              hint="Determines the ID prefix: PRJ for new projects, CIP for continuous improvement."
            >
              <div className="flex">
                {(["New Project", "CIP"] as ProjectType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    aria-pressed={draft.type === t}
                    className={cx(
                      "flex-1 border px-3 py-2 text-sm transition-colors duration-200",
                      draft.type === t
                        ? "border-ink bg-ink text-bg"
                        : "border-line text-muted hover:border-ink hover:text-ink",
                      t === "CIP" && "-ml-px",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field
              label="Project lead"
              htmlFor="leadId"
              required
              error={errors.leadId}
              hint="Only users holding Project Lead or System Admin can be assigned."
            >
              <select
                id="leadId"
                value={draft.leadId}
                onChange={(e) => set("leadId", e.target.value)}
                aria-invalid={!!errors.leadId}
                className={inputClass(!!errors.leadId)}
              >
                <option value="">Select a lead…</option>
                {eligibleLeads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Start date" htmlFor="startDate" required error={errors.startDate}>
              <input
                id="startDate"
                type="date"
                value={draft.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                aria-invalid={!!errors.startDate}
                className={inputClass(!!errors.startDate)}
              />
            </Field>

            <Field label="Target finish date" htmlFor="targetFinishDate" required error={errors.targetFinishDate}>
              <input
                id="targetFinishDate"
                type="date"
                value={draft.targetFinishDate}
                onChange={(e) => set("targetFinishDate", e.target.value)}
                aria-invalid={!!errors.targetFinishDate}
                className={inputClass(!!errors.targetFinishDate)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-6 p-6 lg:p-8">
          <legend className="sr-only">Optional</legend>
          <MonoLabel>03 · Optional</MonoLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Budget" htmlFor="budget" hint="Currency-aware. Can be added later.">
              <div className="flex">
                <select
                  aria-label="Currency"
                  className="border border-line bg-bg px-2.5 py-2 text-sm text-text focus:border-ink focus:outline-none"
                  defaultValue="USD"
                >
                  {["USD", "SGD", "JPY", "EUR"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input id="budget" inputMode="decimal" placeholder="0" className={cx(inputClass(), "-ml-px tnum")} />
              </div>
            </Field>

            <Field label="Vendor name" htmlFor="vendor" hint="Contact, scope and attachments can be added in the workspace.">
              <input id="vendor" className={inputClass()} placeholder="e.g. Daifuku Automation" />
            </Field>
          </div>
        </fieldset>
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-[57px] lg:self-start">
        <div className="space-y-4 border-b border-line p-6 lg:p-7">
          <MonoLabel>Generated ID · preview</MonoLabel>
          <div className="tnum text-[26px] leading-none font-medium tracking-[-0.03em] text-ink">{previewId}</div>
          <p className="text-[12px] leading-relaxed text-muted">
            Format <span className="font-mono">{"{prefix}{YYYY}{MM}{sequence}"}</span>. The final sequence is
            assigned by a transactional counter at creation, so concurrent creates cannot collide.
          </p>
        </div>

        {duplicate && (
          <div className="space-y-3 border-b border-line bg-warn-wash p-6 lg:p-7">
            <StatusBadge tone="warn">Possible duplicate</StatusBadge>
            <p className="text-[13px] leading-relaxed text-text">
              An active project already exists with the same building, area and name.
            </p>
            <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text">
              <input
                type="checkbox"
                checked={duplicateAcknowledged}
                onChange={(e) => setDuplicateAcknowledged(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--accent)]"
              />
              Create it anyway — I have confirmed this is a separate project.
            </label>
          </div>
        )}

        {submitted && Object.keys(errors).length > 0 && (
          <div className="space-y-2 border-b border-line bg-risk-wash p-6 lg:p-7" role="alert">
            <StatusBadge tone="risk">{Object.keys(errors).length} field(s) need attention</StatusBadge>
            <ul className="space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field} className="text-[12px] leading-relaxed text-risk">
                  <a href={`#${field}`} className="underline underline-offset-2">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3 p-6 lg:p-7">
          <Button type="submit" className="w-full" disabled={!!duplicate && !duplicateAcknowledged}>
            Create project
          </Button>
          <Link
            href="/portfolio"
            className="flex w-full items-center justify-center rounded-[2px] border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-surface-hover"
          >
            Cancel
          </Link>
          <p className="text-[12px] leading-relaxed text-muted">
            Creation is recorded in the audit log with actor, timestamp and the full field set.
          </p>
        </div>
      </aside>
    </form>
  );
}
