import type {
  ApprovalState,
  Health,
  KnowledgeCategory,
  ProjectType,
  Role,
  Severity,
  Stage,
} from "@/lib/types";

export type Lang = "en" | "zh";

/**
 * UI chrome only — labels, headings, table headers, buttons, tooltips,
 * validation messages. Seed/mock data (project names, knowledge titles, risk
 * and issue descriptions, user names, the agent's example conversation, audit
 * actor/target/timestamp values) is intentionally left in English: in a real
 * deployment that content comes from a database in whatever language it was
 * entered, the same way this app doesn't retranslate a project called
 * "B2_Litho Bay AMHS Stocker Retrofit_Mei Tan" any more than a production
 * system would.
 *
 * Dates, numbers and currency stay in en-US/UTC formatting regardless of
 * language — the spec calls for "a shared reporting date/time zone" (§4),
 * which a per-viewer locale would undermine for an audited operational tool.
 */
export interface Translations {
  common: {
    cancel: string;
    dataUnavailable: string;
    showAssumptions: string;
    required: string;
    all: string;
  };
  theme: {
    colourTheme: string;
    light: string;
    system: string;
  };
  language: {
    label: string;
    english: string;
    chineseSimplified: string;
  };
  nav: {
    primaryLandmark: string;
    micronHome: string;
    home: string;
    portfolio: string;
    knowledge: string;
    analytics: string;
    administration: string;
    signedIn: string;
    searchAria: string;
    searchPlaceholder: string;
    closeAgentPanel: string;
    openMenu: string;
    closeMenu: string;
  };
  footer: {
    trademark: string;
  };
  home: {
    pageLabel: string;
    greeting: (firstName: string) => string;
    description: string;
    newProject: string;
    viewPortfolio: string;
    statLeadLabel: string;
    statLeadNote: string;
    statAttentionLabel: string;
    statAttentionNote: string;
    statOverdueLabel: string;
    statOverdueNote: string;
    statKnowledgeLabel: string;
    statKnowledgeNote: string;
    attentionRequired: string;
    projectsOffPlan: string;
    allProjects: string;
    progress: string;
    criticalRisks: string;
    overdue: string;
    target: string;
    agentInsights: string;
    overnightFindings: string;
    insight1: string;
    insight2: string;
    insight3: string;
    knowledgeLabel: string;
    recentlyUpdated: string;
    hub: string;
    yourQueue: string;
    overdueActions: string;
    updated: (timestamp: string) => string;
    tableIssue: string;
    tableProject: string;
    tableSeverity: string;
    tableOwner: string;
    tableAge: string;
  };
  portfolio: {
    pageLabel: string;
    title: string;
    description: string;
    newProject: string;
    search: string;
    searchPlaceholder: string;
    buildingLabel: string;
    typeLabel: string;
    stageLabel: string;
    countOf: (filtered: number, total: number) => string;
    viewAria: string;
    viewTable: string;
    viewCards: string;
    viewTimeline: string;
    stageDistribution: string;
    dataUnavailableFiltered: string;
    noMatches: string;
    noMatchesDescription: string;
    colProject: string;
    colBuildingArea: string;
    colType: string;
    colStage: string;
    colHealth: string;
    colLead: string;
    colProgress: string;
    colTarget: string;
    colBudget: string;
    plannedTitle: (pct: number) => string;
    planInline: (pct: number) => string;
    cardStage: string;
    cardSchedule: string;
    cardLead: string;
    cardTarget: string;
  };
  newProject: {
    pageLabel: string;
    title: string;
    description: string;
    sectionLocation: string;
    sectionProject: string;
    sectionOptional: string;
    legendLocation: string;
    legendProject: string;
    legendOptional: string;
    fieldBuilding: string;
    fieldOtherBuildingName: string;
    fieldArea: string;
    fieldProjectName: string;
    fieldProjectType: string;
    fieldProjectLead: string;
    fieldStartDate: string;
    fieldTargetFinishDate: string;
    fieldBudget: string;
    fieldVendorName: string;
    selectBuildingPlaceholder: string;
    otherBuildingPlaceholder: string;
    areaPlaceholder: string;
    projectNamePlaceholder: string;
    selectLeadPlaceholder: string;
    vendorNamePlaceholder: string;
    typeHint: string;
    leadHint: string;
    budgetHint: string;
    vendorHint: string;
    idPreviewLabel: string;
    idPreviewHint: string;
    projectNameHint: string;
    namePreviewLabel: string;
    namePreviewHint: string;
    namePreviewEmpty: string;
    duplicateBadge: string;
    duplicateDescription: string;
    duplicateAcknowledge: string;
    fieldsNeedAttention: (count: number) => string;
    createProject: string;
    cancel: string;
    auditFootnote: string;
    createdBadge: string;
    createdDescription: (name: string, location: string, area: string) => string;
    goToPortfolio: string;
    createAnother: string;
    errors: {
      buildingRequired: string;
      otherBuildingRequired: string;
      areaRequired: string;
      nameRequired: string;
      leadRequired: string;
      leadInvalidRole: string;
      startDateRequired: string;
      targetDateRequired: string;
      targetBeforeStart: string;
    };
  };
  project: {
    sectionLabel: string;
    metaBuildingArea: string;
    metaStage: string;
    metaLead: string;
    metaStart: string;
    metaTargetFinish: string;
    metaDataAsOf: string;
    deleteProject: string;
    deleteDialogLabel: string;
    deleteDialogTitle: (id: string) => string;
    deleteDialogDescription: (name: string) => string;
    deletedLabel: string;
    deletedDescription: string;
    notFoundLabel: string;
    notFoundDescription: (id: string) => string;
    goToPortfolio: string;
    tabs: {
      overview: string;
      timeline: string;
      risksIssues: string;
      vendor: string;
      benefits: string;
      experience: string;
      file: string;
    };
    tabsAria: string;
    kpi: {
      statusLabel: string;
      statusDefinition: (drivers: string) => string;
      driverOnHold: string;
      driverCancelled: string;
      driverScheduleVariance: (pct: number) => string;
      driverCriticalRisks: (count: number) => string;
      driverOverdueIssues: (count: number) => string;
      driverBudgetOverrun: (amount: string) => string;
      driverNone: string;
      progressLabel: string;
      progressDefinition: string;
      plannedPct: (pct: number) => string;
      variancePct: (pct: number) => string;
      budgetLabel: string;
      budgetDefinition: (approved: string, forecast: string) => string;
      variance: string;
      spentOf: (approved: string, currency: string) => string;
      roiLabel: string;
      roiDefinition: (assumptions: string) => string;
      payback: string;
      months: (n: number) => string;
      expected: string;
      openIssuesLabel: string;
      openIssuesDefinition: string;
      noOpenIssues: string;
      risksLabel: string;
      risksDefinition: string;
      topRisk: (title: string, exposure: number) => string;
      noOpenRisks: string;
      vendorStatusLabel: string;
      vendorStatusDefinition: string;
      openActions: string;
      noVendor: string;
      aiUsageLabel: string;
      aiUsageDefinition: string;
      actionsConfirmed: string;
      promptsSummary: (users: number, hours: number) => string;
    };
    charts: {
      progressTitle: string;
      progressDefinition: string;
      budgetTitle: string;
      budgetDefinition: string;
    };
    lists: {
      topRisksByExposure: string;
      noRisksOnProject: string;
      riskMeta: (id: string, exposure: number, owner: string) => string;
      openIssuesTitle: string;
      noIssuesOnProject: string;
      issueMeta: (id: string, owner: string, ageDays: number) => string;
      overdue: string;
    };
    timeline: {
      weight: (n: number) => string;
      planned: (date: string) => string;
      actual: (date: string) => string;
      notComplete: string;
    };
    risksIssues: {
      riskRegister: string;
      colId: string;
      colRisk: string;
      colSeverity: string;
      colProbabilityImpact: string;
      colOwner: string;
      colMitigation: string;
      noRisks: string;
      issueRegister: string;
      colIssue: string;
      colAge: string;
      colState: string;
      noIssues: string;
      overdueBadge: string;
      onTimeBadge: string;
    };
    vendor: {
      noVendorLabel: string;
      noVendorDescription: string;
      vendorLabel: string;
      vendorDefinition: string;
      contractMilestonesLabel: string;
      contractMilestonesDefinition: string;
      openActionsLabel: string;
      openActionsDefinition: string;
      lastUpdateLabel: string;
      lastUpdateDefinition: string;
      scorecard: string;
      scorecardDefinition: string;
      delivery: string;
      quality: string;
      responsiveness: string;
    };
    benefits: {
      hcSaving: string;
      hcSavingDefinition: string;
      energySaving: string;
      energySavingDefinition: string;
      planned: string;
      validated: string;
      realized: string;
    };
    experience: {
      banner: string;
      context: string;
      contextValue: (name: string, area: string, stage: string, lead: string) => string;
      goalOutcome: string;
      whatWorked: string;
      issueRootCause: string;
      countermeasure: string;
      reusableArtifacts: string;
      notCaptured: string;
    };
    files: {
      banner: string;
      foldersLabel: string;
      contentsLabel: string;
      emptyTitle: string;
      emptyDescription: string;
      subfoldersPending: string;
      folders: Record<string, string>;
    };
  };
  knowledge: {
    pageLabel: string;
    title: string;
    description: string;
    search: string;
    searchPlaceholder: string;
    searchHint: string;
    category: string;
    allCategories: string;
    approvalState: string;
    countOf: (filtered: number, total: number) => string;
    approvedOnlyNote: string;
    noMatches: string;
    noMatchesDescription: string;
    owner: (name: string) => string;
    effective: (date: string) => string;
    review: (date: string) => string;
  };
  analytics: {
    pageLabel: string;
    title: string;
    description: string;
    activeProjectsLabel: string;
    activeProjectsNote: string;
    behindPlanLabel: string;
    behindPlanNote: string;
    approvedCapitalLabel: string;
    approvedCapitalNote: (forecast: string) => string;
    realizedHcLabel: string;
    realizedHcNote: string;
    stageDistribution: string;
    scheduleVarianceByProject: string;
    knowledgeHealth: string;
    approvalReviewCoverage: string;
    approvedCoverage: string;
    approvedCoverageNote: (approved: number, total: number) => string;
    awaitingReview: string;
    awaitingReviewNote: string;
    reuseSignal: string;
    reuseSignalHealthy: string;
    reuseSignalNote: string;
  };
  admin: {
    pageLabel: string;
    title: string;
    description: string;
    accessModel: string;
    rolesAndPermissions: string;
    colRole: string;
    colCorePermissions: string;
    colUsers: string;
    governance: string;
    recentAuditEvents: string;
    colActor: string;
    colAction: string;
    colTarget: string;
    colOutcome: string;
    colTimestamp: string;
    auditRetention: string;
    auditRetentionBody: string;
    rolePermissions: Record<Role, string>;
    auditActions: string[];
  };
  agent: {
    name: string;
    aiOperationsAgent: string;
    panelAria: string;
    sources: string;
    actionConfirmed: string;
    actionDiscarded: string;
    proposedChange: string;
    confirmAndApply: string;
    discard: string;
    you: string;
    askAgent: string;
    inputPlaceholder: string;
    citeNote: string;
    send: string;
  };
  chart: {
    progressAria: string;
    planned: string;
    actual: string;
    captionText: string;
    colPeriod: string;
    colPlannedPct: string;
    colActualPct: string;
    budgetActual: string;
    budgetCommitted: string;
    budgetApproved: string;
    budgetForecast: string;
  };
  enum: {
    health: Record<Health, string>;
    severity: Record<Severity, string>;
    stage: Record<Stage, string>;
    projectType: Record<ProjectType, string>;
    approvalState: Record<ApprovalState, string>;
    knowledgeCategory: Record<KnowledgeCategory, string>;
    role: Record<Role, string>;
    mitigationStatus: Record<string, string>;
    auditOutcome: Record<string, string>;
    building: Record<string, string>;
  };
}

export const en: Translations = {
  common: {
    cancel: "Cancel",
    dataUnavailable: "Data unavailable",
    showAssumptions: "Show calculation assumptions",
    required: "required",
    all: "All",
  },
  theme: {
    colourTheme: "Colour theme",
    light: "Light",
    system: "System",
  },
  language: {
    label: "Language",
    english: "English",
    chineseSimplified: "Chinese (Simplified)",
  },
  nav: {
    primaryLandmark: "Primary",
    micronHome: "Micron — Automation Digital Brain home",
    home: "Home",
    portfolio: "Projects",
    knowledge: "Knowledge",
    analytics: "Analytics",
    administration: "Administration",
    signedIn: "Signed in",
    searchAria: "Search projects and knowledge",
    searchPlaceholder: "Search projects, documents…",
    closeAgentPanel: "Close agent panel",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  footer: {
    trademark:
      "Micron™ and the Micron orbit logo are trademarks of Micron Technology, Inc. · Internal use only · Confirm final wording with Micron legal and brand owners before production.",
  },
  home: {
    pageLabel: "Home",
    greeting: (firstName) => `Good morning, ${firstName}.`,
    description: "Your assigned work, the projects that need attention today, and what the agent found overnight.",
    newProject: "New project",
    viewPortfolio: "View portfolio",
    statLeadLabel: "Projects you lead",
    statLeadNote: "Active across all stages, excluding closed and cancelled.",
    statAttentionLabel: "Need attention",
    statAttentionNote: "At Risk or Off Track under the current health rules.",
    statOverdueLabel: "Overdue actions",
    statOverdueNote: "Issues past their owner action date across your projects.",
    statKnowledgeLabel: "Knowledge due review",
    statKnowledgeNote: "Approved documents approaching their scheduled review date.",
    attentionRequired: "Attention required",
    projectsOffPlan: "Projects off plan",
    allProjects: "All projects",
    progress: "Progress",
    criticalRisks: "Critical risks",
    overdue: "Overdue",
    target: "Target",
    agentInsights: "Agent insights",
    overnightFindings: "Overnight findings",
    insight1:
      "PRJ202609001 matches the 2025 B3 rail alignment failure pattern. The lesson recommends a receiving inspection gate that is not in the current milestone plan.",
    insight2: "Vendor responsiveness for Daifuku dropped to 64 over the last 30 days, the lowest of any active vendor.",
    insight3: "Two approved SOPs referenced by active projects reach their review date within 90 days.",
    knowledgeLabel: "Knowledge",
    recentlyUpdated: "Recently updated",
    hub: "Hub",
    yourQueue: "Your queue",
    overdueActions: "Overdue actions",
    updated: (timestamp) => `Updated ${timestamp}`,
    tableIssue: "Issue",
    tableProject: "Project",
    tableSeverity: "Severity",
    tableOwner: "Owner",
    tableAge: "Age",
  },
  portfolio: {
    pageLabel: "Portfolio",
    title: "Project portfolio",
    description: "Every automation project with its current stage, health, and owner. Filters and views respect your role scope.",
    newProject: "New project",
    search: "Search",
    searchPlaceholder: "Project name, ID, area, or lead…",
    buildingLabel: "Building",
    typeLabel: "Type",
    stageLabel: "Stage",
    countOf: (filtered, total) => `${filtered} of ${total} projects`,
    viewAria: "View",
    viewTable: "table",
    viewCards: "cards",
    viewTimeline: "timeline",
    stageDistribution: "Stage distribution",
    dataUnavailableFiltered: "Data unavailable for the current filters.",
    noMatches: "No matches",
    noMatchesDescription: "No project matches these filters. Clear a filter or widen the search.",
    colProject: "Project",
    colBuildingArea: "Building / Area",
    colType: "Type",
    colStage: "Stage",
    colHealth: "Health",
    colLead: "Lead",
    colProgress: "Progress",
    colTarget: "Target",
    colBudget: "Budget",
    plannedTitle: (pct) => `Planned ${pct}%`,
    planInline: (pct) => `plan ${pct}%`,
    cardStage: "Stage",
    cardSchedule: "Schedule",
    cardLead: "Lead",
    cardTarget: "Target",
  },
  newProject: {
    pageLabel: "Create",
    title: "New project",
    description:
      "The project ID is generated server-side at creation and never changes, even if the type or dates are edited later.",
    sectionLocation: "01 · Location",
    sectionProject: "02 · Project",
    sectionOptional: "03 · Optional",
    legendLocation: "Location",
    legendProject: "Project",
    legendOptional: "Optional",
    fieldBuilding: "Building",
    fieldOtherBuildingName: "Other building name",
    fieldArea: "Area",
    fieldProjectName: "Project name",
    fieldProjectType: "Project type",
    fieldProjectLead: "Project lead",
    fieldStartDate: "Start date",
    fieldTargetFinishDate: "Target finish date",
    fieldBudget: "Budget",
    fieldVendorName: "Vendor name",
    selectBuildingPlaceholder: "Select a building…",
    otherBuildingPlaceholder: "e.g. Central Utility Building",
    areaPlaceholder: "e.g. Litho Bay 4",
    projectNamePlaceholder: "e.g. AMHS Upgrade",
    selectLeadPlaceholder: "Select a lead…",
    vendorNamePlaceholder: "e.g. Daifuku Automation",
    typeHint: "Determines the ID prefix: PRJ for new projects, CIP for continuous improvement.",
    leadHint: "Only users holding Project Lead or System Admin can be assigned.",
    budgetHint: "Currency-aware. Can be added later.",
    vendorHint: "Contact, scope and attachments can be added in the workspace.",
    projectNameHint: "Describe the work only. The building and lead are added automatically.",
    idPreviewLabel: "Generated ID · preview",
    idPreviewHint:
      "Format {prefix}{YYYY}{MM}{sequence}. The final sequence is assigned by a transactional counter at creation, so concurrent creates cannot collide.",
    namePreviewLabel: "Generated name · preview",
    namePreviewHint:
      "Format {building}_{name}_{lead}. Unlike the ID this is derived, so it is recomposed if the building or lead is changed later.",
    namePreviewEmpty: "Fill in building, name and lead.",
    duplicateBadge: "Possible duplicate",
    duplicateDescription: "An active project already exists with the same building, area and name.",
    duplicateAcknowledge: "Create it anyway — I have confirmed this is a separate project.",
    fieldsNeedAttention: (count) => `${count} field(s) need attention`,
    createProject: "Create project",
    cancel: "Cancel",
    auditFootnote: "Creation is recorded in the audit log with actor, timestamp and the full field set.",
    createdBadge: "Project created",
    createdDescription: (name, location, area) =>
      `${name} has been created in ${location} · ${area}. The ID is immutable and the creation event is recorded in the audit log.`,
    goToPortfolio: "Go to portfolio",
    createAnother: "Create another",
    errors: {
      buildingRequired: "Building is required.",
      otherBuildingRequired: "Name the building when Others is selected.",
      areaRequired: "Area is required.",
      nameRequired: "Project name is required.",
      leadRequired: "Project lead is required.",
      leadInvalidRole: "Lead must hold the Project Lead or System Admin role.",
      startDateRequired: "Start date is required.",
      targetDateRequired: "Target finish date is required.",
      targetBeforeStart: "Target finish date cannot precede the start date.",
    },
  },
  project: {
    sectionLabel: "Project",
    metaBuildingArea: "Building / Area",
    metaStage: "Stage",
    metaLead: "Lead",
    metaStart: "Start",
    metaTargetFinish: "Target finish",
    metaDataAsOf: "Data as of",
    deleteProject: "Delete project",
    deleteDialogLabel: "Delete project",
    deleteDialogTitle: (id) => `Delete ${id}?`,
    deleteDialogDescription: (name) =>
      `This removes "${name}" and its risks, issues, milestones and benefit data from your view in this browser. This cannot be undone.`,
    deletedLabel: "Project deleted",
    deletedDescription: "Returning to the portfolio…",
    notFoundLabel: "Not found",
    notFoundDescription: (id) => `No project matches ${id}. It may not exist, or you may not have permission to view it.`,
    goToPortfolio: "Go to portfolio",
    tabs: {
      overview: "Overview",
      timeline: "Timeline",
      risksIssues: "Risks & issues",
      vendor: "Vendor",
      benefits: "Benefits",
      experience: "Experience",
      file: "File",
    },
    tabsAria: "Project sections",
    kpi: {
      statusLabel: "Project status",
      statusDefinition: (drivers) => `Health is derived from schedule, risk, issue and budget rules. Drivers: ${drivers}`,
      driverOnHold: "Project stage is On Hold.",
      driverCancelled: "Project is cancelled.",
      driverScheduleVariance: (pct) => `Schedule variance ${pct}%.`,
      driverCriticalRisks: (count) => `${count} critical risk${count > 1 ? "s" : ""} open.`,
      driverOverdueIssues: (count) => `${count} overdue issue${count > 1 ? "s" : ""}.`,
      driverBudgetOverrun: (amount) => `Forecast exceeds approved budget by ${amount}.`,
      driverNone: "No schedule, risk, issue or budget rule triggered.",
      progressLabel: "Project progress",
      progressDefinition:
        "Percent complete from weighted milestones. Planned progress is interpolated from the milestone baseline. A manual override is audited and shown alongside, never instead of, the weighted roll-up.",
      plannedPct: (pct) => `Planned ${pct}%`,
      variancePct: (pct) => `${pct > 0 ? "+" : ""}${pct}% variance`,
      budgetLabel: "Budget",
      budgetDefinition: (approved, forecast) =>
        `Approved ${approved}; forecast at completion ${forecast}. Variance is approved minus forecast.`,
      variance: "Variance",
      spentOf: (approved, currency) => `spent of ${approved} ${currency}`,
      roiLabel: "ROI",
      roiDefinition: (assumptions) =>
        `(annualized quantified benefit − annual operating cost) / total project cost × 100. Assumptions: ${assumptions}`,
      payback: "Payback",
      months: (n) => `${n} months`,
      expected: "Expected",
      openIssuesLabel: "Open issues",
      openIssuesDefinition: "Count by severity with age. Overdue means the owner action date has passed.",
      noOpenIssues: "No open issues",
      risksLabel: "Risks",
      risksDefinition: "Exposure is probability × impact on a 1–5 scale. Top risks are ranked by exposure.",
      topRisk: (title, exposure) => `Top: ${title} (exposure ${exposure})`,
      noOpenRisks: "No open risks",
      vendorStatusLabel: "Vendor status",
      vendorStatusDefinition: "Vendor health combines contractual milestone completion with delivery, quality and responsiveness scores.",
      openActions: "Open actions",
      noVendor: "No vendor is attached to this project.",
      aiUsageLabel: "AI usage",
      aiUsageDefinition: "Agent activity scoped to this project. Prompt text is never exposed to users without permission.",
      actionsConfirmed: "Actions confirmed",
      promptsSummary: (users, hours) => `prompts · ${users} users · ~${hours}h saved`,
    },
    charts: {
      progressTitle: "Progress · planned vs actual",
      progressDefinition: "Actual is the weighted milestone roll-up at each period close. Future periods show planned only.",
      budgetTitle: "Budget consumption",
      budgetDefinition:
        "The black rule marks the approved budget. The coloured rule marks forecast at completion — red when forecast exceeds approved.",
    },
    lists: {
      topRisksByExposure: "Top risks by exposure",
      noRisksOnProject: "No open risks on this project.",
      riskMeta: (id, exposure, owner) => `${id} · exposure ${exposure} · ${owner}`,
      openIssuesTitle: "Open issues",
      noIssuesOnProject: "No open issues on this project.",
      issueMeta: (id, owner, ageDays) => `${id} · ${owner} · ${ageDays}d old`,
      overdue: "Overdue",
    },
    timeline: {
      weight: (n) => `weight ${n}`,
      planned: (date) => `Planned ${date}`,
      actual: (date) => `Actual ${date}`,
      notComplete: "Not complete",
    },
    risksIssues: {
      riskRegister: "Risk register",
      colId: "ID",
      colRisk: "Risk",
      colSeverity: "Severity",
      colProbabilityImpact: "P × I",
      colOwner: "Owner",
      colMitigation: "Mitigation",
      noRisks: "No open risks.",
      issueRegister: "Issue register",
      colIssue: "Issue",
      colAge: "Age",
      colState: "State",
      noIssues: "No open issues.",
      overdueBadge: "Overdue",
      onTimeBadge: "On time",
    },
    vendor: {
      noVendorLabel: "No vendor",
      noVendorDescription: "This project has no vendor attached.",
      vendorLabel: "Vendor",
      vendorDefinition: "Vendor of record for this project's contracted scope.",
      contractMilestonesLabel: "Contract milestones",
      contractMilestonesDefinition: "Contractual milestones marked complete by the project lead.",
      openActionsLabel: "Open actions",
      openActionsDefinition: "Vendor actions awaiting response or delivery.",
      lastUpdateLabel: "Last update",
      lastUpdateDefinition: "Date of the most recent vendor status update recorded against this project.",
      scorecard: "Scorecard",
      scorecardDefinition: "Rolling 90-day scores out of 100, recorded by the project lead at each vendor review.",
      delivery: "Delivery",
      quality: "Quality",
      responsiveness: "Responsiveness",
    },
    benefits: {
      hcSaving: "HC saving",
      hcSavingDefinition:
        "Headcount saving in FTE. Validated requires a manager-approved time study; realized requires post-implementation measurement.",
      energySaving: "Energy saving",
      energySavingDefinition:
        "Annualized kWh saving. Requires baseline, post-implementation value, measurement period, conversion factors and evidence.",
      planned: "Planned",
      validated: "Validated",
      realized: "Realized",
    },
    experience: {
      banner:
        "The agent can draft this report from the project record, milestones and meeting log. It will never submit on your behalf — you review and confirm every field before it is saved.",
      context: "Context",
      contextValue: (name, area, stage, lead) => `${name} · ${area} · stage ${stage} · lead ${lead}`,
      goalOutcome: "Goal and delivered outcome",
      whatWorked: "What worked well",
      issueRootCause: "Issue / failure and root cause",
      countermeasure: "Countermeasure and recommendation",
      reusableArtifacts: "Reusable artifacts and evidence",
      notCaptured: "Not yet captured.",
    },
    files: {
      banner:
        "The folder structure is fixed across every project so a document's place in the tree records which phase produced it. Upload, versioning and retention arrive with the storage backend.",
      foldersLabel: "Folders",
      contentsLabel: "Contents",
      emptyTitle: "Empty",
      emptyDescription: "No documents have been filed here yet.",
      subfoldersPending: "Subfolders for this stage are not yet defined.",
      folders: {
        initial: "Project Initial",
        designing: "Project Designing",
        implementation: "Project Implement & Release Production",
        close: "Project Close",
        cip: "Project CIP & Improvement",
        afterSales: "After Sales Services",
        commercial: "Commercial Documents",
        statusUpdate: "Project Status Update",

        background: "Background & Proposed Solution",
        benefitRoi: "Benefit & ROI",
        reviewApproval: "Project Review & Budget Approval",
        vendorEvaluation: "Vendor Evaluation",
        meetingMinutes: "Meeting Minutes & Email & Fax",
        others: "Others",
        requirement: "Requirement",
        design: "Designing",
        schedule: "Schedule",
        fac: "FAC",
        dispatchReceiving: "Dispatch & Receiving",
        setupInstallation: "Set Up & Installation",
        commissioning: "Commissioning",
        uatSac: "UAT & SAC",
        ccb: "CCB",
        tryRunRelease: "Try Run & Release",
        ra: "RA",
        handover: "Handover Document",
        photoVideo: "Photo & Video",
        closeMeeting: "Close Meeting",
        projectLink: "Project Link",
        sowQuotationPo: "SOW & Quotation & PO",
        issueSolution: "Issue & Solution",
        nda: "NDA",
        poRecord: "PO Record",
        invoice: "Invoice",
      },
    },
  },
  knowledge: {
    pageLabel: "Knowledge",
    title: "Knowledge hub",
    description:
      "Governed engineering knowledge. Only approved revisions are used as trusted agent context; drafts and in-review items are visible but excluded from retrieval.",
    search: "Search",
    searchPlaceholder: "Title, tag, owner…",
    searchHint: "Full-text and semantic search across permitted content.",
    category: "Category",
    allCategories: "All categories",
    approvalState: "Approval state",
    countOf: (filtered, total) => `${filtered} of ${total} items`,
    approvedOnlyNote: "Approved revisions only in agent context",
    noMatches: "No matches",
    noMatchesDescription: "Nothing matches these facets. Clear a filter or widen the search.",
    owner: (name) => `Owner ${name}`,
    effective: (date) => `Effective ${date}`,
    review: (date) => `Review ${date}`,
  },
  analytics: {
    pageLabel: "Analytics",
    title: "Portfolio analytics",
    description:
      "Cross-project trends for stage mix, schedule and budget variance, benefit realization, and knowledge health. Figures respect your organizational scope.",
    activeProjectsLabel: "Active projects",
    activeProjectsNote: "Excluding cancelled projects.",
    behindPlanLabel: "Behind plan",
    behindPlanNote: "Negative schedule variance against the milestone baseline.",
    approvedCapitalLabel: "Approved capital",
    approvedCapitalNote: (forecast) => `Forecast at completion ${forecast}.`,
    realizedHcLabel: "Realized HC saving",
    realizedHcNote: "Sum of validated post-implementation measurements only.",
    stageDistribution: "Stage distribution",
    scheduleVarianceByProject: "Schedule variance by project",
    knowledgeHealth: "Knowledge health",
    approvalReviewCoverage: "Approval and review coverage",
    approvedCoverage: "Approved coverage",
    approvedCoverageNote: (approved, total) => `${approved} of ${total} items are in the Approved state and eligible as agent context.`,
    awaitingReview: "Awaiting review",
    awaitingReviewNote: "Items in review are excluded from retrieval until approved.",
    reuseSignal: "Reuse signal",
    reuseSignalHealthy: "Healthy",
    reuseSignalNote: "Lessons learned were cited on 4 of 5 active projects in the last 30 days.",
  },
  admin: {
    pageLabel: "Administration",
    title: "Users, roles, and audit",
    description: "Least-privilege defaults with project- and document-level grants. Every read, write, download, and AI action is recorded.",
    accessModel: "Access model",
    rolesAndPermissions: "Roles and core permissions",
    colRole: "Role",
    colCorePermissions: "Core permissions",
    colUsers: "Users",
    governance: "Governance",
    recentAuditEvents: "Recent audit events",
    colActor: "Actor",
    colAction: "Action",
    colTarget: "Target",
    colOutcome: "Outcome",
    colTimestamp: "Timestamp",
    auditRetention: "Audit retention",
    auditRetentionBody:
      "Audit events are immutable and retained per Micron internal policy. Retention periods, export controls, and the list of classifications excluded from AI processing must be confirmed with IT, security, and legal before production launch.",
    rolePermissions: {
      "System Admin": "Configure users, roles, taxonomies, retention, integrations, and all records.",
      "Project Lead": "Create and manage assigned projects, milestones, team, documents, reports, and agent actions.",
      Engineer: "Contribute to assigned projects; upload, revise and search permitted knowledge; submit lessons learned.",
      Visitor: "Read-only access to specifically shared, approved content.",
    },
    auditActions: [
      "Updated milestone M2 actual date",
      "Proposed milestone creation — awaiting confirmation",
      "Submitted BKM for review",
      "Granted Engineer role",
      "Attempted download of restricted document",
    ],
  },
  agent: {
    name: "Agent",
    aiOperationsAgent: "AI Operations Agent",
    panelAria: "Agent AI assistant",
    sources: "Sources",
    actionConfirmed: "Action confirmed · logged to audit",
    actionDiscarded: "Action discarded",
    proposedChange: "Proposed change · confirmation required",
    confirmAndApply: "Confirm and apply",
    discard: "Discard",
    you: "You",
    askAgent: "Ask agent",
    inputPlaceholder: "Ask about a project, or describe a draft to create…",
    citeNote: "Answers cite approved sources only",
    send: "Send",
  },
  chart: {
    progressAria: "Planned versus actual progress over time",
    planned: "Planned",
    actual: "Actual",
    captionText: "Planned versus actual progress by period",
    colPeriod: "Period",
    colPlannedPct: "Planned %",
    colActualPct: "Actual %",
    budgetActual: "Actual",
    budgetCommitted: "Committed",
    budgetApproved: "Approved",
    budgetForecast: "Forecast",
  },
  enum: {
    health: {
      "On Track": "On Track",
      "At Risk": "At Risk",
      "Off Track": "Off Track",
      "On Hold": "On Hold",
      Cancelled: "Cancelled",
    },
    severity: {
      Critical: "Critical",
      High: "High",
      Medium: "Medium",
      Low: "Low",
    },
    stage: {
      Draft: "Draft",
      Planned: "Planned",
      "In Progress": "In Progress",
      FAT: "FAT",
      SAT: "SAT",
      "Buy-off": "Buy-off",
      Closed: "Closed",
      "On Hold": "On Hold",
      Cancelled: "Cancelled",
    },
    projectType: {
      "New Project": "New Project",
      CIP: "CIP",
    },
    approvalState: {
      Draft: "Draft",
      "In Review": "In Review",
      Approved: "Approved",
      Superseded: "Superseded",
    },
    knowledgeCategory: {
      SOP: "SOP",
      BKM: "BKM",
      FAT: "FAT",
      SAT: "SAT",
      "Buy-off": "Buy-off",
      "Lessons Learned": "Lessons Learned",
      "Vendor Documents": "Vendor Documents",
      "Meeting Minutes": "Meeting Minutes",
      "Design Documents": "Design Documents",
    },
    role: {
      "System Admin": "System Admin",
      "Project Lead": "Project Lead",
      Engineer: "Engineer",
      Visitor: "Visitor",
    },
    mitigationStatus: {
      "Not started": "Not started",
      "In progress": "In progress",
      Complete: "Complete",
    },
    auditOutcome: {
      Success: "Success",
      Pending: "Pending",
      Denied: "Denied",
    },
    building: {
      Others: "Others",
    },
  },
};

export const zh: Translations = {
  common: {
    cancel: "取消",
    dataUnavailable: "数据不可用",
    showAssumptions: "显示计算假设",
    required: "必填",
    all: "全部",
  },
  theme: {
    colourTheme: "配色主题",
    light: "浅色",
    system: "跟随系统",
  },
  language: {
    label: "语言",
    english: "英文",
    chineseSimplified: "简体中文",
  },
  nav: {
    primaryLandmark: "主导航",
    micronHome: "美光 — 自动化数字大脑首页",
    home: "首页",
    portfolio: "项目",
    knowledge: "知识库",
    analytics: "分析",
    administration: "管理",
    signedIn: "已登录",
    searchAria: "搜索项目和知识",
    searchPlaceholder: "搜索项目、文档…",
    closeAgentPanel: "关闭智能体面板",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
  },
  footer: {
    trademark: "Micron™ 及美光轨道标志是美光科技公司（Micron Technology, Inc.）的商标 · 仅限内部使用 · 正式发布前请与美光法务及品牌部门确认最终文案。",
  },
  home: {
    pageLabel: "首页",
    greeting: (firstName) => `早上好，${firstName}。`,
    description: "您负责的工作、今天需要关注的项目，以及智能体昨夜发现的问题。",
    newProject: "新建项目",
    viewPortfolio: "查看项目组合",
    statLeadLabel: "您负责的项目",
    statLeadNote: "涵盖所有阶段，不含已关闭和已取消的项目。",
    statAttentionLabel: "需要关注",
    statAttentionNote: "根据当前健康度规则判定为有风险或已偏离。",
    statOverdueLabel: "逾期事项",
    statOverdueNote: "您的项目中已超过负责人处理期限的问题。",
    statKnowledgeLabel: "知识待复审",
    statKnowledgeNote: "已批准文档即将到达计划复审日期。",
    attentionRequired: "需要关注",
    projectsOffPlan: "偏离计划的项目",
    allProjects: "所有项目",
    progress: "进度",
    criticalRisks: "重大风险",
    overdue: "已逾期",
    target: "目标日期",
    agentInsights: "智能体洞察",
    overnightFindings: "夜间发现",
    insight1: "PRJ202609001 与 2025 年 B3 导轨对准失效模式相符。该经验建议增加到货检验环节，但目前的里程碑计划中尚未包含。",
    insight2: "过去 30 天内，Daifuku 的供应商响应速度降至 64，为所有在建供应商中最低。",
    insight3: "在建项目引用的两份已批准标准作业程序（SOP）将在 90 天内到达复审日期。",
    knowledgeLabel: "知识库",
    recentlyUpdated: "最近更新",
    hub: "知识中心",
    yourQueue: "您的待办",
    overdueActions: "逾期事项",
    updated: (timestamp) => `更新于 ${timestamp}`,
    tableIssue: "问题",
    tableProject: "项目",
    tableSeverity: "严重程度",
    tableOwner: "负责人",
    tableAge: "已持续",
  },
  portfolio: {
    pageLabel: "项目组合",
    title: "项目组合",
    description: "所有自动化项目及其当前阶段、健康度和负责人。筛选与视图会依据您的角色权限范围显示。",
    newProject: "新建项目",
    search: "搜索",
    searchPlaceholder: "项目名称、编号、区域或负责人…",
    buildingLabel: "厂房",
    typeLabel: "类型",
    stageLabel: "阶段",
    countOf: (filtered, total) => `共 ${total} 个项目，显示 ${filtered} 个`,
    viewAria: "视图",
    viewTable: "表格",
    viewCards: "卡片",
    viewTimeline: "时间线",
    stageDistribution: "阶段分布",
    dataUnavailableFiltered: "当前筛选条件下数据不可用。",
    noMatches: "无匹配结果",
    noMatchesDescription: "没有项目符合当前筛选条件。请清除筛选条件或扩大搜索范围。",
    colProject: "项目",
    colBuildingArea: "厂房 / 区域",
    colType: "类型",
    colStage: "阶段",
    colHealth: "健康度",
    colLead: "负责人",
    colProgress: "进度",
    colTarget: "目标日期",
    colBudget: "预算",
    plannedTitle: (pct) => `计划 ${pct}%`,
    planInline: (pct) => `计划 ${pct}%`,
    cardStage: "阶段",
    cardSchedule: "进度偏差",
    cardLead: "负责人",
    cardTarget: "目标日期",
  },
  newProject: {
    pageLabel: "创建",
    title: "新建项目",
    description: "项目编号在创建时由服务端生成，此后即使类型或日期被修改也不会改变。",
    sectionLocation: "01 · 位置",
    sectionProject: "02 · 项目",
    sectionOptional: "03 · 可选",
    legendLocation: "位置",
    legendProject: "项目",
    legendOptional: "可选",
    fieldBuilding: "厂房",
    fieldOtherBuildingName: "其他厂房名称",
    fieldArea: "区域",
    fieldProjectName: "项目名称",
    fieldProjectType: "项目类型",
    fieldProjectLead: "项目负责人",
    fieldStartDate: "开始日期",
    fieldTargetFinishDate: "目标完成日期",
    fieldBudget: "预算",
    fieldVendorName: "供应商名称",
    selectBuildingPlaceholder: "请选择厂房…",
    otherBuildingPlaceholder: "例如：中央动力站",
    areaPlaceholder: "例如：光刻区 4",
    projectNamePlaceholder: "例如：AMHS 自动化立库改造",
    selectLeadPlaceholder: "请选择负责人…",
    vendorNamePlaceholder: "例如：大福（Daifuku）",
    typeHint: "决定编号前缀：新建项目为 PRJ，持续改进项目为 CIP。",
    leadHint: "仅可指定具有项目负责人或系统管理员角色的用户。",
    budgetHint: "支持多币种，可稍后补充。",
    vendorHint: "联系方式、范围和附件可在项目工作区中补充。",
    projectNameHint: "仅需描述工作内容，厂房与负责人会自动添加。",
    idPreviewLabel: "生成编号 · 预览",
    idPreviewHint: "格式为 {prefix}{YYYY}{MM}{sequence}。最终序号由创建时的事务性计数器分配，因此并发创建不会冲突。",
    namePreviewLabel: "生成名称 · 预览",
    namePreviewHint: "格式为 {厂房}_{名称}_{负责人}。与编号不同，该名称是派生的，若日后修改厂房或负责人会重新生成。",
    namePreviewEmpty: "请填写厂房、名称和负责人。",
    duplicateBadge: "可能重复",
    duplicateDescription: "已存在相同厂房、区域和名称的在建项目。",
    duplicateAcknowledge: "仍要创建 — 我已确认这是一个独立的项目。",
    fieldsNeedAttention: (count) => `有 ${count} 个字段需要处理`,
    createProject: "创建项目",
    cancel: "取消",
    auditFootnote: "创建操作将连同操作人、时间戳及完整字段记录到审计日志。",
    createdBadge: "项目已创建",
    createdDescription: (name, location, area) => `${name} 已在 ${location} · ${area} 创建。该编号不可更改，创建事件已记录到审计日志。`,
    goToPortfolio: "前往项目组合",
    createAnother: "再创建一个",
    errors: {
      buildingRequired: "请选择厂房。",
      otherBuildingRequired: "选择“其他”时须填写厂房名称。",
      areaRequired: "请填写区域。",
      nameRequired: "请填写项目名称。",
      leadRequired: "请选择项目负责人。",
      leadInvalidRole: "负责人必须具有项目负责人或系统管理员角色。",
      startDateRequired: "请选择开始日期。",
      targetDateRequired: "请选择目标完成日期。",
      targetBeforeStart: "目标完成日期不能早于开始日期。",
    },
  },
  project: {
    sectionLabel: "项目",
    metaBuildingArea: "厂房 / 区域",
    metaStage: "阶段",
    metaLead: "负责人",
    metaStart: "开始日期",
    metaTargetFinish: "目标完成日期",
    metaDataAsOf: "数据截至",
    deleteProject: "删除项目",
    deleteDialogLabel: "删除项目",
    deleteDialogTitle: (id) => `删除 ${id}？`,
    deleteDialogDescription: (name) => `此操作将从您此浏览器的视图中移除“${name}”及其风险、问题、里程碑和效益数据。此操作无法撤销。`,
    deletedLabel: "项目已删除",
    deletedDescription: "正在返回项目组合…",
    notFoundLabel: "未找到",
    notFoundDescription: (id) => `没有与 ${id} 匹配的项目。该项目可能不存在，或您没有查看权限。`,
    goToPortfolio: "前往项目组合",
    tabs: {
      overview: "概览",
      timeline: "时间线",
      risksIssues: "风险与问题",
      vendor: "供应商",
      benefits: "效益",
      experience: "经验总结",
      file: "文件",
    },
    tabsAria: "项目分区",
    kpi: {
      statusLabel: "项目状态",
      statusDefinition: (drivers) => `健康度根据进度、风险、问题和预算规则综合判定。判定依据：${drivers}`,
      driverOnHold: "项目阶段为已暂停。",
      driverCancelled: "项目已取消。",
      driverScheduleVariance: (pct) => `进度偏差 ${pct}%。`,
      driverCriticalRisks: (count) => `存在 ${count} 个重大风险。`,
      driverOverdueIssues: (count) => `存在 ${count} 个逾期问题。`,
      driverBudgetOverrun: (amount) => `预测超出已批准预算 ${amount}。`,
      driverNone: "未触发任何进度、风险、问题或预算规则。",
      progressLabel: "项目进度",
      progressDefinition: "根据加权里程碑计算的完成百分比。计划进度根据里程碑基线插值得出。人工修正值会被记录并与加权汇总值并列显示，而非替代它。",
      plannedPct: (pct) => `计划 ${pct}%`,
      variancePct: (pct) => `偏差 ${pct > 0 ? "+" : ""}${pct}%`,
      budgetLabel: "预算",
      budgetDefinition: (approved, forecast) => `已批准 ${approved}；完工预测 ${forecast}。偏差为已批准预算减去预测值。`,
      variance: "偏差",
      spentOf: (approved, currency) => `已用 / 共 ${approved} ${currency}`,
      roiLabel: "投资回报率",
      roiDefinition: (assumptions) => `（年化量化效益 − 年运营成本）/ 项目总成本 × 100。假设条件：${assumptions}`,
      payback: "回本周期",
      months: (n) => `${n} 个月`,
      expected: "预期",
      openIssuesLabel: "未结问题",
      openIssuesDefinition: "按严重程度及持续时间统计。逾期指已超过负责人处理期限。",
      noOpenIssues: "暂无未结问题",
      risksLabel: "风险",
      risksDefinition: "风险敞口 = 可能性 × 影响，按 1–5 分制评估。重大风险按敞口排序。",
      topRisk: (title, exposure) => `首要风险：${title}（敞口 ${exposure}）`,
      noOpenRisks: "暂无未结风险",
      vendorStatusLabel: "供应商状态",
      vendorStatusDefinition: "供应商健康度综合合同里程碑完成情况、交付、质量及响应速度评分。",
      openActions: "待处理事项",
      noVendor: "该项目未关联供应商。",
      aiUsageLabel: "AI 使用情况",
      aiUsageDefinition: "智能体在该项目范围内的活动情况。未经授权，提示词内容不会向用户展示。",
      actionsConfirmed: "已确认操作数",
      promptsSummary: (users, hours) => `次提问 · ${users} 位用户 · 约节省 ${hours} 小时`,
    },
    charts: {
      progressTitle: "进度 · 计划与实际对比",
      progressDefinition: "实际值为每个周期结束时的加权里程碑汇总。未来周期仅显示计划值。",
      budgetTitle: "预算消耗",
      budgetDefinition: "黑色刻度线标示已批准预算。彩色刻度线标示完工预测 — 预测超出已批准预算时显示为红色。",
    },
    lists: {
      topRisksByExposure: "按敞口排序的重大风险",
      noRisksOnProject: "该项目暂无未结风险。",
      riskMeta: (id, exposure, owner) => `${id} · 敞口 ${exposure} · ${owner}`,
      openIssuesTitle: "未结问题",
      noIssuesOnProject: "该项目暂无未结问题。",
      issueMeta: (id, owner, ageDays) => `${id} · ${owner} · 已持续 ${ageDays} 天`,
      overdue: "已逾期",
    },
    timeline: {
      weight: (n) => `权重 ${n}`,
      planned: (date) => `计划 ${date}`,
      actual: (date) => `实际 ${date}`,
      notComplete: "尚未完成",
    },
    risksIssues: {
      riskRegister: "风险登记表",
      colId: "编号",
      colRisk: "风险",
      colSeverity: "严重程度",
      colProbabilityImpact: "可能性 × 影响",
      colOwner: "负责人",
      colMitigation: "缓解措施",
      noRisks: "暂无未结风险。",
      issueRegister: "问题登记表",
      colIssue: "问题",
      colAge: "已持续",
      colState: "状态",
      noIssues: "暂无未结问题。",
      overdueBadge: "已逾期",
      onTimeBadge: "按期",
    },
    vendor: {
      noVendorLabel: "无供应商",
      noVendorDescription: "该项目未关联供应商。",
      vendorLabel: "供应商",
      vendorDefinition: "负责该项目合同范围的正式供应商。",
      contractMilestonesLabel: "合同里程碑",
      contractMilestonesDefinition: "由项目负责人标记为已完成的合同里程碑。",
      openActionsLabel: "待处理事项",
      openActionsDefinition: "等待供应商响应或交付的事项。",
      lastUpdateLabel: "最近更新",
      lastUpdateDefinition: "该项目最近一次记录的供应商状态更新日期。",
      scorecard: "评分卡",
      scorecardDefinition: "滚动 90 天评分（满分 100），由项目负责人在每次供应商评审时记录。",
      delivery: "交付",
      quality: "质量",
      responsiveness: "响应速度",
    },
    benefits: {
      hcSaving: "人力节省",
      hcSavingDefinition: "以全职当量（FTE）计的人力节省。已验证需经经理批准的工时研究；已实现需经实施后测量。",
      energySaving: "能耗节省",
      energySavingDefinition: "年化千瓦时节省量。需提供基线值、实施后数值、测量周期、换算系数及支持证据。",
      planned: "计划",
      validated: "已验证",
      realized: "已实现",
    },
    experience: {
      banner: "智能体可根据项目记录、里程碑和会议纪要起草本报告，但绝不会代您提交 — 您需在保存前审阅并确认每一项内容。",
      context: "背景信息",
      contextValue: (name, area, stage, lead) => `${name} · ${area} · 阶段：${stage} · 负责人：${lead}`,
      goalOutcome: "目标与实际成果",
      whatWorked: "有效做法",
      issueRootCause: "问题 / 失败及根本原因",
      countermeasure: "改进措施与建议",
      reusableArtifacts: "可复用成果与证据",
      notCaptured: "尚未记录。",
    },
    files: {
      banner:
        "文件夹结构在所有项目中保持一致，因此文档在目录中的位置即表明其产生于哪个阶段。上传、版本管理及保留策略将随存储后端一并上线。",
      foldersLabel: "文件夹",
      contentsLabel: "内容",
      emptyTitle: "暂无内容",
      emptyDescription: "此处尚未归档任何文档。",
      subfoldersPending: "该阶段的子文件夹尚未定义。",
      folders: {
        initial: "项目启动",
        designing: "项目设计",
        implementation: "项目实施与量产放行",
        close: "项目关闭",
        cip: "项目持续改进",
        afterSales: "售后服务",
        commercial: "商务文件",
        statusUpdate: "项目状态更新",

        background: "背景与方案建议",
        benefitRoi: "效益与投资回报率",
        reviewApproval: "项目评审与预算审批",
        vendorEvaluation: "供应商评估",
        meetingMinutes: "会议纪要、邮件与传真",
        others: "其他",
        requirement: "需求",
        design: "设计",
        schedule: "进度计划",
        fac: "FAC",
        dispatchReceiving: "发运与收货",
        setupInstallation: "安装与搭建",
        commissioning: "调试",
        uatSac: "UAT 与 SAC",
        ccb: "CCB",
        tryRunRelease: "试运行与放行",
        ra: "RA",
        handover: "移交文件",
        photoVideo: "照片与视频",
        closeMeeting: "关闭会议",
        projectLink: "项目关联",
        sowQuotationPo: "SOW、报价与 PO",
        issueSolution: "问题与解决方案",
        nda: "保密协议（NDA）",
        poRecord: "采购订单（PO）记录",
        invoice: "发票",
      },
    },
  },
  knowledge: {
    pageLabel: "知识库",
    title: "知识中心",
    description: "受管控的工程知识库。仅已批准版本会作为智能体的可信上下文；草稿及待审阅项目可见但不参与检索。",
    search: "搜索",
    searchPlaceholder: "标题、标签、负责人…",
    searchHint: "在权限范围内的内容中进行全文及语义搜索。",
    category: "分类",
    allCategories: "所有分类",
    approvalState: "批准状态",
    countOf: (filtered, total) => `共 ${total} 项，显示 ${filtered} 项`,
    approvedOnlyNote: "仅已批准版本纳入智能体上下文",
    noMatches: "无匹配结果",
    noMatchesDescription: "没有内容符合当前筛选条件。请清除筛选条件或扩大搜索范围。",
    owner: (name) => `负责人 ${name}`,
    effective: (date) => `生效日期 ${date}`,
    review: (date) => `复审日期 ${date}`,
  },
  analytics: {
    pageLabel: "分析",
    title: "项目组合分析",
    description: "跨项目的阶段分布、进度与预算偏差、效益实现情况及知识健康度趋势。数据依据您的组织权限范围显示。",
    activeProjectsLabel: "在建项目",
    activeProjectsNote: "不含已取消的项目。",
    behindPlanLabel: "落后于计划",
    behindPlanNote: "相对里程碑基线的负进度偏差。",
    approvedCapitalLabel: "已批准资金",
    approvedCapitalNote: (forecast) => `完工预测 ${forecast}。`,
    realizedHcLabel: "已实现人力节省",
    realizedHcNote: "仅统计已验证的实施后测量值总和。",
    stageDistribution: "阶段分布",
    scheduleVarianceByProject: "各项目进度偏差",
    knowledgeHealth: "知识健康度",
    approvalReviewCoverage: "批准与复审覆盖率",
    approvedCoverage: "已批准覆盖率",
    approvedCoverageNote: (approved, total) => `共 ${total} 项中有 ${approved} 项处于已批准状态，可作为智能体上下文。`,
    awaitingReview: "待复审",
    awaitingReviewNote: "待审阅项目在获批前不参与检索。",
    reuseSignal: "复用信号",
    reuseSignalHealthy: "健康",
    reuseSignalNote: "过去 30 天内，经验总结已被 5 个在建项目中的 4 个引用。",
  },
  admin: {
    pageLabel: "管理",
    title: "用户、角色与审计",
    description: "默认采用最小权限原则，支持项目级与文档级授权。所有读取、写入、下载及 AI 操作均会被记录。",
    accessModel: "权限模型",
    rolesAndPermissions: "角色与核心权限",
    colRole: "角色",
    colCorePermissions: "核心权限",
    colUsers: "用户数",
    governance: "治理",
    recentAuditEvents: "近期审计事件",
    colActor: "操作人",
    colAction: "操作",
    colTarget: "对象",
    colOutcome: "结果",
    colTimestamp: "时间戳",
    auditRetention: "审计保留策略",
    auditRetentionBody: "审计事件不可更改，并按美光内部政策保留。保留期限、导出控制，以及排除在 AI 处理范围之外的分类清单，须在正式上线前经 IT、安全及法务部门确认。",
    rolePermissions: {
      "System Admin": "配置用户、角色、分类体系、保留策略、集成及全部记录。",
      "Project Lead": "创建并管理所负责的项目、里程碑、团队、文档、报告及智能体操作。",
      Engineer: "参与所分配的项目；上传、修订及搜索权限范围内的知识内容；提交经验总结。",
      Visitor: "仅可只读访问特定共享的已批准内容。",
    },
    auditActions: [
      "更新了里程碑 M2 的实际日期",
      "提议创建里程碑 — 等待确认",
      "提交了最佳实践方法（BKM）供审阅",
      "授予了工程师角色",
      "尝试下载受限文档",
    ],
  },
  agent: {
    name: "智能体",
    aiOperationsAgent: "AI 运营助手",
    panelAria: "智能体 AI 助手",
    sources: "来源",
    actionConfirmed: "操作已确认 · 已记录至审计日志",
    actionDiscarded: "操作已放弃",
    proposedChange: "拟议变更 · 需要确认",
    confirmAndApply: "确认并应用",
    discard: "放弃",
    you: "您",
    askAgent: "向智能体提问",
    inputPlaceholder: "询问某个项目，或描述需要起草的内容…",
    citeNote: "回答仅引用已批准的来源",
    send: "发送",
  },
  chart: {
    progressAria: "计划与实际进度随时间对比",
    planned: "计划",
    actual: "实际",
    captionText: "各周期计划与实际进度对比",
    colPeriod: "周期",
    colPlannedPct: "计划 %",
    colActualPct: "实际 %",
    budgetActual: "实际",
    budgetCommitted: "已承诺",
    budgetApproved: "已批准",
    budgetForecast: "预测",
  },
  enum: {
    health: {
      "On Track": "正常",
      "At Risk": "有风险",
      "Off Track": "已偏离",
      "On Hold": "已暂停",
      Cancelled: "已取消",
    },
    severity: {
      Critical: "严重",
      High: "高",
      Medium: "中",
      Low: "低",
    },
    stage: {
      Draft: "草稿",
      Planned: "已计划",
      "In Progress": "进行中",
      FAT: "工厂验收测试",
      SAT: "现场验收测试",
      "Buy-off": "验收",
      Closed: "已关闭",
      "On Hold": "已暂停",
      Cancelled: "已取消",
    },
    projectType: {
      "New Project": "新建项目",
      CIP: "持续改进",
    },
    approvalState: {
      Draft: "草稿",
      "In Review": "审阅中",
      Approved: "已批准",
      Superseded: "已作废",
    },
    knowledgeCategory: {
      SOP: "标准作业程序",
      BKM: "最佳实践方法",
      FAT: "工厂验收测试",
      SAT: "现场验收测试",
      "Buy-off": "验收",
      "Lessons Learned": "经验总结",
      "Vendor Documents": "供应商文档",
      "Meeting Minutes": "会议纪要",
      "Design Documents": "设计文档",
    },
    role: {
      "System Admin": "系统管理员",
      "Project Lead": "项目负责人",
      Engineer: "工程师",
      Visitor: "访客",
    },
    mitigationStatus: {
      "Not started": "未开始",
      "In progress": "进行中",
      Complete: "已完成",
    },
    auditOutcome: {
      Success: "成功",
      Pending: "待处理",
      Denied: "已拒绝",
    },
    building: {
      Others: "其他",
    },
  },
};

export const dictionaries: Record<Lang, Translations> = { en, zh };
