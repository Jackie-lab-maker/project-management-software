/**
 * The project file taxonomy. The first layer is fixed and identical across
 * every project — it mirrors the project lifecycle, so a document's place in
 * the tree is itself a statement about which phase produced it.
 *
 * Folders are keyed rather than named here: the display name comes from
 * translations.ts (project.files.folders) so the tree reads in the viewer's
 * language while the key stays stable as a storage path segment.
 *
 * Keys are unique among siblings, not globally — "meetingMinutes" and
 * "others" recur under several phases and deliberately share one label.
 * A stored path is the chain of keys (initial/meetingMinutes), which stays
 * distinct even where the leaf key repeats.
 */
export interface ProjectFolder {
  key: string;
  children?: ProjectFolder[];
}

export const PROJECT_FOLDERS: ProjectFolder[] = [
  {
    key: "initial",
    children: [
      { key: "background" },
      { key: "benefitRoi" },
      { key: "reviewApproval" },
      { key: "vendorEvaluation" },
      { key: "meetingMinutes" },
      { key: "others" },
    ],
  },
  {
    key: "designing",
    children: [{ key: "requirement" }, { key: "design" }, { key: "meetingMinutes" }],
  },
  {
    key: "implementation",
    children: [
      { key: "schedule" },
      { key: "fac" },
      { key: "dispatchReceiving" },
      { key: "setupInstallation" },
      { key: "commissioning" },
      { key: "uatSac" },
      { key: "ccb" },
      { key: "tryRunRelease" },
      { key: "ra" },
      { key: "meetingMinutes" },
      { key: "others" },
    ],
  },
  {
    key: "close",
    children: [
      { key: "handover" },
      { key: "photoVideo" },
      { key: "closeMeeting" },
      { key: "meetingMinutes" },
    ],
  },
  { key: "cip", children: [{ key: "projectLink" }] },
  { key: "afterSales", children: [{ key: "sowQuotationPo" }, { key: "issueSolution" }] },
  { key: "commercial", children: [{ key: "nda" }, { key: "poRecord" }, { key: "invoice" }] },
  { key: "statusUpdate" },
];
