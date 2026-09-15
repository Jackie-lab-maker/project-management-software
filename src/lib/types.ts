export type Role =
  | "System Admin"
  | "Project Lead"
  | "Engineer"
  | "Technician"
  | "Manager"
  | "Visitor";

export type Building = "B1" | "B2" | "B3" | "B5" | "Others";

export type ProjectType = "New Project" | "CIP";

export type Stage =
  | "Draft"
  | "Planned"
  | "In Progress"
  | "FAT"
  | "SAT"
  | "Buy-off"
  | "Closed"
  | "On Hold"
  | "Cancelled";

export type Health = "On Track" | "At Risk" | "Off Track" | "On Hold" | "Cancelled";

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  org: string;
}

/**
 * A metric whose inputs may be incomplete. The spec requires showing
 * "Data unavailable" rather than zero, so absence is modelled explicitly
 * rather than collapsed into 0.
 */
export type Measure<T> = { status: "available"; value: T } | { status: "unavailable"; reason: string };

export const available = <T,>(value: T): Measure<T> => ({ status: "available", value });
export const unavailable = <T,>(reason: string): Measure<T> => ({ status: "unavailable", reason });

export interface Budget {
  currency: string;
  approved: number;
  committed: number;
  actual: number;
  forecastAtCompletion: number;
}

export interface Roi {
  expectedPct: Measure<number>;
  realizedPct: Measure<number>;
  paybackMonths: Measure<number>;
  assumptions: string;
}

export interface VendorStatus {
  name: string;
  health: Health;
  contact: string;
  milestonesComplete: number;
  milestonesTotal: number;
  delivery: number;
  quality: number;
  responsiveness: number;
  openActions: number;
  lastUpdate: string;
}

export interface Risk {
  id: string;
  title: string;
  severity: Severity;
  probability: number;
  impact: number;
  owner: string;
  mitigation: string;
  mitigationStatus: "Not started" | "In progress" | "Complete";
}

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  owner: string;
  ageDays: number;
  overdue: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  weight: number;
  complete: boolean;
}

export interface Benefit {
  plannedFte: Measure<number>;
  validatedFte: Measure<number>;
  realizedFte: Measure<number>;
  plannedKwh: Measure<number>;
  validatedKwh: Measure<number>;
  realizedKwh: Measure<number>;
  measurementPeriod: string;
}

export interface AiUsage {
  activeUsers: number;
  prompts: number;
  citedSearches: number;
  draftsProposed: number;
  actionsConfirmed: number;
  estimatedHoursSaved: number;
}

export interface ProgressPoint {
  label: string;
  planned: number;
  actual: number | null;
}

export interface Project {
  id: string;
  name: string;
  building: Building;
  otherBuildingName?: string;
  area: string;
  type: ProjectType;
  lead: User;
  stage: Stage;
  health: Health;
  healthOverrideReason?: string;
  startDate: string;
  targetFinishDate: string;
  lastUpdated: string;
  budget: Budget;
  roi: Roi;
  vendor?: VendorStatus;
  risks: Risk[];
  issues: Issue[];
  milestones: Milestone[];
  benefit: Benefit;
  ai: AiUsage;
  progressSeries: ProgressPoint[];
  manualProgressOverride?: { value: number; reason: string; by: string };
}

export type KnowledgeCategory =
  | "SOP"
  | "BKM"
  | "FAT"
  | "SAT"
  | "Buy-off"
  | "Lessons Learned"
  | "Vendor Documents"
  | "Meeting Minutes"
  | "Design Documents";

export type ApprovalState = "Draft" | "In Review" | "Approved" | "Superseded";

export interface KnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  owner: string;
  projectId?: string;
  building?: Building;
  revision: string;
  state: ApprovalState;
  effectiveDate: string;
  reviewDate: string;
  tags: string[];
}

export interface Citation {
  knowledgeId: string;
  title: string;
  revision: string;
  effectiveDate: string;
}

export interface AgentMessage {
  id: string;
  author: "user" | "agent";
  text: string;
  citations?: Citation[];
  /** A state-changing action the agent proposes; always requires confirmation. */
  proposedAction?: {
    summary: string;
    changes: { field: string; from: string; to: string }[];
  };
}
