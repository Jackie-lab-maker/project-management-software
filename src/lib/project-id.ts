import type { ProjectType } from "./types";

const PREFIX: Record<ProjectType, string> = {
  "New Project": "PRJ",
  CIP: "CIP",
};

export const prefixFor = (type: ProjectType) => PREFIX[type];

/**
 * Formats a project ID as {prefix}{YYYY}{MM}{sequence}.
 *
 * The real sequence must come from a transactional per-(prefix, year, month)
 * counter with a unique constraint so concurrent creates cannot collide, and
 * the resulting ID is immutable even if type or dates later change (spec §3).
 * This formatter is the shared shape used by both the server counter and the
 * client-side preview.
 */
export function formatProjectId(type: ProjectType, date: Date, sequence: number): string {
  const yyyy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(sequence).padStart(3, "0");
  return `${PREFIX[type]}${yyyy}${mm}${seq}`;
}

/** Next sequence for a (prefix, year, month) bucket, given existing IDs. */
export function nextSequence(existingIds: string[], type: ProjectType, date: Date): number {
  const bucket = `${PREFIX[type]}${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const used = existingIds
    .filter((id) => id.startsWith(bucket))
    .map((id) => Number.parseInt(id.slice(bucket.length), 10))
    .filter((n) => Number.isFinite(n));
  return used.length === 0 ? 1 : Math.max(...used) + 1;
}

export interface ProjectDraft {
  building: string;
  otherBuildingName?: string;
  area: string;
  name: string;
  leadId: string;
  type: ProjectType;
  startDate: string;
  targetFinishDate: string;
}

export type FieldErrors = Partial<Record<keyof ProjectDraft, string>>;

/** Mirrors the validation rules in spec §3 so the form and API agree. */
export function validateDraft(
  draft: ProjectDraft,
  opts: { eligibleLeadIds: string[] },
): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.building) errors.building = "Building is required.";
  if (draft.building === "Others" && !draft.otherBuildingName?.trim()) {
    errors.otherBuildingName = "Name the building when Others is selected.";
  }
  if (!draft.area.trim()) errors.area = "Area is required.";
  if (!draft.name.trim()) errors.name = "Project name is required.";

  if (!draft.leadId) {
    errors.leadId = "Project lead is required.";
  } else if (!opts.eligibleLeadIds.includes(draft.leadId)) {
    errors.leadId = "Lead must hold the Project Lead or System Admin role.";
  }

  if (!draft.startDate) errors.startDate = "Start date is required.";
  if (!draft.targetFinishDate) {
    errors.targetFinishDate = "Target finish date is required.";
  } else if (draft.startDate && draft.targetFinishDate < draft.startDate) {
    errors.targetFinishDate = "Target finish date cannot precede the start date.";
  }

  return errors;
}

/**
 * Duplicate detection is a confirmation gate, not a hard block — the spec
 * allows the same building/area/name with an explicit confirmation.
 */
export function findDuplicate<T extends { building: string; area: string; name: string; stage: string }>(
  draft: ProjectDraft,
  projects: T[],
): T | undefined {
  const norm = (s: string) => s.trim().toLowerCase();
  return projects.find(
    (p) =>
      p.stage !== "Closed" &&
      p.stage !== "Cancelled" &&
      norm(p.building) === norm(draft.building) &&
      norm(p.area) === norm(draft.area) &&
      norm(p.name) === norm(draft.name),
  );
}
