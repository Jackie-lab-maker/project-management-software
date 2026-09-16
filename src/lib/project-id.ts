import { unavailable, type Project, type ProjectType, type User } from "./types";

const PREFIX: Record<ProjectType, string> = {
  "New Project": "PRJ",
  CIP: "CIP",
};

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

/**
 * "B5_AMHS Upgrade_Jackie Shao". Derived, unlike the immutable ID — recompose
 * it when the building or lead changes rather than trusting a stored name.
 * Empty segments drop out so a half-filled form previews cleanly.
 */
export function composeProjectName(building: string, descriptor: string, leadName: string): string {
  return [building, descriptor, leadName].map((s) => s.trim()).filter(Boolean).join("_");
}

export interface ProjectDraft {
  building: string;
  otherBuildingName?: string;
  area: string;
  /** The typed middle segment only — see composeProjectName for the full name. */
  name: string;
  leadId: string;
  type: ProjectType;
  startDate: string;
  targetFinishDate: string;
  budgetAmount: string;
  budgetCurrency: string;
  vendorName: string;
}

/**
 * Codes rather than messages: validation is language-independent logic, so
 * it returns what went wrong and the form renders that into the active
 * language via translations.ts's newProject.errors.
 */
type FieldErrorCode =
  | "buildingRequired"
  | "otherBuildingRequired"
  | "areaRequired"
  | "nameRequired"
  | "leadRequired"
  | "leadInvalidRole"
  | "startDateRequired"
  | "targetDateRequired"
  | "targetBeforeStart";

export type FieldErrors = Partial<Record<keyof ProjectDraft, FieldErrorCode>>;

/** Mirrors the validation rules in spec §3 so the form and API agree. */
export function validateDraft(
  draft: ProjectDraft,
  opts: { eligibleLeadIds: string[] },
): FieldErrors {
  const errors: FieldErrors = {};

  if (!draft.building) errors.building = "buildingRequired";
  if (draft.building === "Others" && !draft.otherBuildingName?.trim()) {
    errors.otherBuildingName = "otherBuildingRequired";
  }
  if (!draft.area.trim()) errors.area = "areaRequired";
  if (!draft.name.trim()) errors.name = "nameRequired";

  if (!draft.leadId) {
    errors.leadId = "leadRequired";
  } else if (!opts.eligibleLeadIds.includes(draft.leadId)) {
    errors.leadId = "leadInvalidRole";
  }

  if (!draft.startDate) errors.startDate = "startDateRequired";
  if (!draft.targetFinishDate) {
    errors.targetFinishDate = "targetDateRequired";
  } else if (draft.startDate && draft.targetFinishDate < draft.startDate) {
    errors.targetFinishDate = "targetBeforeStart";
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

/** A flat planned-vs-actual series spanning start→target, actual not yet begun. */
function initialProgressSeries(startDate: string, targetFinishDate: string) {
  const start = new Date(startDate);
  const end = new Date(targetFinishDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const steps = Math.max(months, 1);
  const points = Math.min(steps + 1, 6);

  return Array.from({ length: points }, (_, i) => {
    const cursor = new Date(start);
    cursor.setMonth(start.getMonth() + Math.round((i / (points - 1 || 1)) * steps));
    return {
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      planned: Math.round((i / (points - 1 || 1)) * 100),
      actual: i === 0 ? 0 : null,
    };
  });
}

/**
 * Builds a full Project record from a validated draft, immutable ID, and
 * resolved lead. Fields the create form does not collect (risks, milestones,
 * benefits, AI usage, ...) start empty or "unavailable" rather than zero —
 * there is nothing to report yet, which is different from having measured a
 * zero.
 */
export function buildProject(id: string, draft: ProjectDraft, lead: User): Project {
  const budgetApproved = Number.parseFloat(draft.budgetAmount);
  const approved = Number.isFinite(budgetApproved) ? budgetApproved : 0;
  const otherBuildingName = draft.building === "Others" ? draft.otherBuildingName?.trim() : undefined;

  return {
    id,
    name: composeProjectName(otherBuildingName ?? draft.building, draft.name, lead.name),
    building: draft.building as Project["building"],
    otherBuildingName,
    area: draft.area.trim(),
    type: draft.type,
    lead,
    stage: "Draft",
    health: "On Track",
    startDate: draft.startDate,
    targetFinishDate: draft.targetFinishDate,
    lastUpdated: new Date().toISOString(),
    budget: {
      currency: draft.budgetCurrency,
      approved,
      committed: 0,
      actual: 0,
      forecastAtCompletion: approved,
    },
    roi: {
      expectedPct: unavailable("Benefit model not yet defined."),
      realizedPct: unavailable("Project has not reached measurement stage."),
      paybackMonths: unavailable("Benefit model not yet defined."),
      assumptions: "Not yet defined.",
    },
    vendor: draft.vendorName.trim()
      ? {
          name: draft.vendorName.trim(),
          health: "On Track",
          contact: "Not yet provided.",
          milestonesComplete: 0,
          milestonesTotal: 0,
          delivery: 0,
          quality: 0,
          responsiveness: 0,
          openActions: 0,
          lastUpdate: new Date().toISOString().slice(0, 10),
        }
      : undefined,
    risks: [],
    issues: [],
    milestones: [],
    benefit: {
      plannedFte: unavailable("Benefit model not yet defined."),
      validatedFte: unavailable("Benefit model not yet defined."),
      realizedFte: unavailable("Project has not reached measurement stage."),
      plannedKwh: unavailable("Benefit model not yet defined."),
      validatedKwh: unavailable("Benefit model not yet defined."),
      realizedKwh: unavailable("Project has not reached measurement stage."),
      measurementPeriod: "Not yet defined.",
    },
    ai: {
      activeUsers: 0,
      prompts: 0,
      citedSearches: 0,
      draftsProposed: 0,
      actionsConfirmed: 0,
      estimatedHoursSaved: 0,
    },
    progressSeries: initialProgressSeries(draft.startDate, draft.targetFinishDate),
  };
}
