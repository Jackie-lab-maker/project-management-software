"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/AppShell";
import { Button, MonoLabel, StatusBadge, cx } from "@/components/ui/primitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { eligibleLeads } from "@/lib/mock-data";
import {
  buildProject,
  composeProjectName,
  findDuplicate,
  formatProjectId,
  nextSequence,
  validateDraft,
  type FieldErrors,
  type ProjectDraft,
} from "@/lib/project-id";
import { buildingLabel } from "@/lib/metrics";
import { addCreatedProject, useProjects } from "@/lib/project-store";
import type { Building, ProjectType } from "@/lib/types";

const BUILDINGS: Building[] = ["B1", "B2", "B3", "B5", "Others"];
const CURRENCIES = ["USD", "SGD", "JPY", "EUR"] as const;

const EMPTY: ProjectDraft = {
  building: "",
  otherBuildingName: "",
  area: "",
  name: "",
  leadId: "",
  type: "New Project",
  startDate: "",
  targetFinishDate: "",
  budgetAmount: "",
  budgetCurrency: "USD",
  vendorName: "",
};

function Field({
  label,
  htmlFor,
  required,
  requiredLabel,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  requiredLabel: string;
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
            {requiredLabel}
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
  const { t } = useLanguage();
  const tp = t.newProject;
  const projects = useProjects();
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
  }, [draft.type, projects]);

  // Previews the whole stored name, not just the segment being typed.
  const previewName = composeProjectName(
    draft.building === "Others" ? draft.otherBuildingName ?? "" : draft.building,
    draft.name,
    eligibleLeads.find((u) => u.id === draft.leadId)?.name ?? "",
  );

  // Compared against stored names, which are composed the same way — so two
  // projects sharing a descriptor but led by different people are not flagged.
  const duplicate = useMemo(() => {
    if (!draft.building || !draft.area.trim() || !draft.name.trim()) return undefined;
    return findDuplicate(
      { ...draft, name: previewName },
      projects.map((p) => ({ building: buildingLabel(p), area: p.area, name: p.name, stage: p.stage, id: p.id })),
    );
  }, [draft, previewName, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateDraft(draft, { eligibleLeadIds: eligibleLeads.map((u) => u.id) });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (duplicate && !duplicateAcknowledged) return;

    const lead = eligibleLeads.find((u) => u.id === draft.leadId);
    if (!lead) return; // unreachable: validateDraft already checked leadId

    const project = buildProject(previewId, draft, lead);
    addCreatedProject(project);
    setCreated(previewId);
  };

  if (created) {
    const location = draft.building === "Others" ? draft.otherBuildingName ?? "" : draft.building;
    return (
      <div className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-lg space-y-6 border border-line p-8 text-center">
          <MonoLabel tone="accent">{tp.createdBadge}</MonoLabel>
          <div className="tnum text-[34px] leading-none font-medium tracking-[-0.03em] text-ink">{created}</div>
          <p className="text-[14px] leading-relaxed text-muted">
            {tp.createdDescription(previewName, location, draft.area)}
          </p>
          <div className="flex justify-center gap-2.5">
            <Link
              href="/portfolio"
              className="inline-flex items-center rounded-[2px] bg-ink px-4 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-accent"
            >
              {tp.goToPortfolio}
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
              {tp.createAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader label={tp.pageLabel} title={tp.title} description={tp.description} />
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Fields */}
        <div className="border-b border-line lg:border-r lg:border-b-0">
          <fieldset className="space-y-6 border-b border-line p-6 lg:p-8">
            <legend className="sr-only">{tp.legendLocation}</legend>
            <MonoLabel>{tp.sectionLocation}</MonoLabel>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field
                label={tp.fieldBuilding}
                htmlFor="building"
                required
                requiredLabel={t.common.required}
                error={errors.building && tp.errors[errors.building]}
              >
                <select
                  id="building"
                  value={draft.building}
                  onChange={(e) => set("building", e.target.value)}
                  aria-invalid={!!errors.building}
                  className={inputClass(!!errors.building)}
                >
                  <option value="">{tp.selectBuildingPlaceholder}</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {t.enum.building[b] ?? b}
                    </option>
                  ))}
                </select>
              </Field>

              {draft.building === "Others" && (
                <Field
                  label={tp.fieldOtherBuildingName}
                  htmlFor="otherBuildingName"
                  required
                  requiredLabel={t.common.required}
                  error={errors.otherBuildingName && tp.errors[errors.otherBuildingName]}
                >
                  <input
                    id="otherBuildingName"
                    value={draft.otherBuildingName}
                    onChange={(e) => set("otherBuildingName", e.target.value)}
                    aria-invalid={!!errors.otherBuildingName}
                    className={inputClass(!!errors.otherBuildingName)}
                    placeholder={tp.otherBuildingPlaceholder}
                  />
                </Field>
              )}

              <Field
                label={tp.fieldArea}
                htmlFor="area"
                required
                requiredLabel={t.common.required}
                error={errors.area && tp.errors[errors.area]}
              >
                <input
                  id="area"
                  value={draft.area}
                  onChange={(e) => set("area", e.target.value)}
                  aria-invalid={!!errors.area}
                  className={inputClass(!!errors.area)}
                  placeholder={tp.areaPlaceholder}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-6 border-b border-line p-6 lg:p-8">
            <legend className="sr-only">{tp.legendProject}</legend>
            <MonoLabel>{tp.sectionProject}</MonoLabel>

            <Field
              label={tp.fieldProjectName}
              htmlFor="name"
              required
              requiredLabel={t.common.required}
              error={errors.name && tp.errors[errors.name]}
              hint={tp.projectNameHint}
            >
              <input
                id="name"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                className={inputClass(!!errors.name)}
                placeholder={tp.projectNamePlaceholder}
              />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label={tp.fieldProjectType} htmlFor="type" required requiredLabel={t.common.required} hint={tp.typeHint}>
                <div className="flex">
                  {(["New Project", "CIP"] as ProjectType[]).map((ty) => (
                    <button
                      key={ty}
                      type="button"
                      onClick={() => set("type", ty)}
                      aria-pressed={draft.type === ty}
                      className={cx(
                        "flex-1 border px-3 py-2 text-sm transition-colors duration-200",
                        draft.type === ty
                          ? "border-ink bg-ink text-bg"
                          : "border-line text-muted hover:border-ink hover:text-ink",
                        ty === "CIP" && "-ml-px",
                      )}
                    >
                      {t.enum.projectType[ty]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label={tp.fieldProjectLead}
                htmlFor="leadId"
                required
                requiredLabel={t.common.required}
                error={errors.leadId && tp.errors[errors.leadId]}
                hint={tp.leadHint}
              >
                <select
                  id="leadId"
                  value={draft.leadId}
                  onChange={(e) => set("leadId", e.target.value)}
                  aria-invalid={!!errors.leadId}
                  className={inputClass(!!errors.leadId)}
                >
                  <option value="">{tp.selectLeadPlaceholder}</option>
                  {eligibleLeads.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {t.enum.role[u.role]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field
                label={tp.fieldStartDate}
                htmlFor="startDate"
                required
                requiredLabel={t.common.required}
                error={errors.startDate && tp.errors[errors.startDate]}
              >
                <input
                  id="startDate"
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  aria-invalid={!!errors.startDate}
                  className={inputClass(!!errors.startDate)}
                />
              </Field>

              <Field
                label={tp.fieldTargetFinishDate}
                htmlFor="targetFinishDate"
                required
                requiredLabel={t.common.required}
                error={errors.targetFinishDate && tp.errors[errors.targetFinishDate]}
              >
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
            <legend className="sr-only">{tp.legendOptional}</legend>
            <MonoLabel>{tp.sectionOptional}</MonoLabel>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label={tp.fieldBudget} htmlFor="budget" requiredLabel={t.common.required} hint={tp.budgetHint}>
                <div className="flex">
                  <select
                    aria-label="Currency"
                    value={draft.budgetCurrency}
                    onChange={(e) => set("budgetCurrency", e.target.value)}
                    className="border border-line bg-bg px-2.5 py-2 text-sm text-text focus:border-ink focus:outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    id="budget"
                    inputMode="decimal"
                    value={draft.budgetAmount}
                    onChange={(e) => set("budgetAmount", e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="0"
                    className={cx(inputClass(), "-ml-px tnum")}
                  />
                </div>
              </Field>

              <Field label={tp.fieldVendorName} htmlFor="vendor" requiredLabel={t.common.required} hint={tp.vendorHint}>
                <input
                  id="vendor"
                  value={draft.vendorName}
                  onChange={(e) => set("vendorName", e.target.value)}
                  className={inputClass()}
                  placeholder={tp.vendorNamePlaceholder}
                />
              </Field>
            </div>
          </fieldset>
        </div>

        {/* Summary rail */}
        <aside className="lg:sticky lg:top-[57px] lg:self-start">
          <div className="space-y-4 border-b border-line p-6 lg:p-7">
            <MonoLabel>{tp.idPreviewLabel}</MonoLabel>
            <div className="tnum text-[26px] leading-none font-medium tracking-[-0.03em] text-ink">{previewId}</div>
            <p className="text-[12px] leading-relaxed text-muted">{tp.idPreviewHint}</p>
          </div>

          <div className="space-y-4 border-b border-line p-6 lg:p-7">
            <MonoLabel>{tp.namePreviewLabel}</MonoLabel>
            {previewName ? (
              <div className="text-[17px] leading-snug font-medium tracking-[-0.01em] break-words text-ink">
                {previewName}
              </div>
            ) : (
              <div className="text-[15px] text-faint">{tp.namePreviewEmpty}</div>
            )}
            <p className="text-[12px] leading-relaxed text-muted">{tp.namePreviewHint}</p>
          </div>

          {duplicate && (
            <div className="space-y-3 border-b border-line bg-warn-wash p-6 lg:p-7">
              <StatusBadge tone="warn">{tp.duplicateBadge}</StatusBadge>
              <p className="text-[13px] leading-relaxed text-text">{tp.duplicateDescription}</p>
              <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text">
                <input
                  type="checkbox"
                  checked={duplicateAcknowledged}
                  onChange={(e) => setDuplicateAcknowledged(e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--accent)]"
                />
                {tp.duplicateAcknowledge}
              </label>
            </div>
          )}

          {submitted && Object.keys(errors).length > 0 && (
            <div className="space-y-2 border-b border-line bg-risk-wash p-6 lg:p-7" role="alert">
              <StatusBadge tone="risk">{tp.fieldsNeedAttention(Object.keys(errors).length)}</StatusBadge>
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, code]) => (
                  <li key={field} className="text-[12px] leading-relaxed text-risk">
                    <a href={`#${field}`} className="underline underline-offset-2">
                      {tp.errors[code as keyof typeof tp.errors]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 p-6 lg:p-7">
            <Button type="submit" className="w-full" disabled={!!duplicate && !duplicateAcknowledged}>
              {tp.createProject}
            </Button>
            <Link
              href="/portfolio"
              className="flex w-full items-center justify-center rounded-[2px] border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-surface-hover"
            >
              {tp.cancel}
            </Link>
            <p className="text-[12px] leading-relaxed text-muted">{tp.auditFootnote}</p>
          </div>
        </aside>
      </form>
    </>
  );
}
