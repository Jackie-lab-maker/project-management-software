import type { Health, Measure, Project, Risk, Severity } from "./types";

export const SEVERITY_ORDER: Severity[] = ["Critical", "High", "Medium", "Low"];

/**
 * Percent complete from milestone weights. The spec forbids manual percent
 * as the only source, so the weighted roll-up is always computed; an audited
 * manual override is reported alongside it rather than replacing it.
 */
export function weightedProgress(project: Project): number {
  const totalWeight = project.milestones.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 0;
  const done = project.milestones.filter((m) => m.complete).reduce((sum, m) => sum + m.weight, 0);
  return Math.round((done / totalWeight) * 100);
}

/** Planned progress at today's date, interpolated across the milestone plan. */
export function plannedProgress(project: Project, asOf = new Date()): number {
  const totalWeight = project.milestones.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 0;
  const due = project.milestones
    .filter((m) => new Date(m.plannedDate) <= asOf)
    .reduce((sum, m) => sum + m.weight, 0);
  return Math.round((due / totalWeight) * 100);
}

export function scheduleVariance(project: Project): number {
  return weightedProgress(project) - plannedProgress(project);
}

export function budgetVariance(project: Project): number {
  const { approved, forecastAtCompletion } = project.budget;
  return approved - forecastAtCompletion;
}

export function riskExposure(risk: Risk): number {
  return risk.probability * risk.impact;
}

export function topRisks(project: Project, count = 3): Risk[] {
  return [...project.risks].sort((a, b) => riskExposure(b) - riskExposure(a)).slice(0, count);
}

export function issueCounts(project: Project) {
  const bySeverity = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: project.issues.filter((i) => i.severity === severity).length,
  }));
  return {
    bySeverity,
    total: project.issues.length,
    overdue: project.issues.filter((i) => i.overdue).length,
  };
}

/**
 * Derived health from schedule, risk, issue and budget rules. Kept explicit and
 * inspectable because the dashboard must be able to explain why a project is
 * At Risk, and any override requires a reason (spec §4).
 */
export function deriveHealth(project: Project): { health: Health; drivers: string[] } {
  if (project.stage === "On Hold") return { health: "On Hold", drivers: ["Project stage is On Hold."] };
  if (project.stage === "Cancelled") return { health: "Cancelled", drivers: ["Project is cancelled."] };

  const drivers: string[] = [];
  const variance = scheduleVariance(project);
  if (variance <= -15) drivers.push(`Schedule variance ${variance}%.`);
  const criticalRisks = project.risks.filter((r) => r.severity === "Critical").length;
  if (criticalRisks > 0) drivers.push(`${criticalRisks} critical risk${criticalRisks > 1 ? "s" : ""} open.`);
  const overdue = project.issues.filter((i) => i.overdue).length;
  if (overdue > 0) drivers.push(`${overdue} overdue issue${overdue > 1 ? "s" : ""}.`);
  if (budgetVariance(project) < 0) {
    drivers.push(`Forecast exceeds approved budget by ${formatCurrency(Math.abs(budgetVariance(project)), project.budget.currency)}.`);
  }

  const severe = criticalRisks > 0 || variance <= -15;
  if (severe && drivers.length >= 3) return { health: "Off Track", drivers };
  if (drivers.length > 0) return { health: "At Risk", drivers };
  return { health: "On Track", drivers: ["No schedule, risk, issue or budget rule triggered."] };
}

export function formatCurrency(value: number, currency: string, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    // Compact keeps two significant decimals so values that round to the same
    // magnitude ($1.85M approved vs $1.97M forecast) stay distinguishable.
    maximumFractionDigits: compact ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, ...options }).format(value);
}

/** Renders a Measure, honouring the rule that absent inputs never read as zero. */
export function renderMeasure<T>(measure: Measure<T>, format: (value: T) => string): string {
  return measure.status === "available" ? format(measure.value) : "Data unavailable";
}

export function daysUntil(dateIso: string, from = new Date()): number {
  const target = new Date(dateIso);
  return Math.round((target.getTime() - from.getTime()) / 86_400_000);
}

export function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function buildingLabel(project: Project): string {
  return project.building === "Others" ? project.otherBuildingName ?? "Others" : project.building;
}
