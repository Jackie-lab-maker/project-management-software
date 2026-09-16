/**
 * Folders are keyed, not named: labels live in translations.ts so the tree
 * reads in the viewer's language while the key stays stable as a storage path
 * segment. Keys are unique among siblings, not globally — "meetingMinutes"
 * recurs under several phases, and a path is the chain of keys.
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
