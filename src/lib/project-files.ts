/**
 * Folders are keyed, not named: labels live in translations.ts so the tree
 * reads in the viewer's language while the key stays stable as a storage path
 * segment. Keys are unique among siblings, not globally — "meetingMinutes"
 * recurs under several phases, and a path is the chain of keys.
 */
import type { Translations } from "./i18n/translations";

/** Every folder must have a label, and every label must belong to a folder. */
type FolderKey = keyof Translations["project"]["files"]["folders"];

export interface ProjectFolder {
  key: FolderKey;
  children?: ProjectFolder[];
}

export const PROJECT_FOLDERS: ProjectFolder[] = [
  {
    key: "initial",
    children: [
      { key: "background" },
      { key: "benefitRoi" },
      { key: "reviewApproval", children: [{ key: "fundingSlides" }, { key: "reviewSlides" }] },
      {
        key: "vendorEvaluation",
        children: [
          { key: "vendorProposal" },
          { key: "vendorQuotation" },
          { key: "biddingDocument" },
          { key: "ktda" },
        ],
      },
      { key: "meetingMinutes" },
      { key: "others" },
    ],
  },
  {
    key: "designing",
    children: [
      { key: "requirement", children: [{ key: "softwareHardwareRequirement" }, { key: "sowDoc2" }] },
      { key: "design", children: [{ key: "hardwareDesign" }, { key: "softwareDesign" }, { key: "otherDocuments" }] },
      { key: "meetingMinutes" },
    ],
  },
  {
    key: "implementation",
    children: [
      { key: "schedule", children: [{ key: "vendorSchedule" }, { key: "internalSchedule" }] },
      { key: "fac", children: [{ key: "facDocuments" }] },
      { key: "dispatchReceiving", children: [{ key: "batch1" }, { key: "batch2" }, { key: "batch3" }] },
      {
        key: "setupInstallation",
        children: [{ key: "facilityItRequirement" }, { key: "installationDocument" }],
      },
      { key: "commissioning", children: [{ key: "issueSolution" }] },
      { key: "uatSac", children: [{ key: "sac" }, { key: "uat" }, { key: "ehsQaOtherAcceptance" }] },
      { key: "ccb", children: [{ key: "gcpChange" }, { key: "others" }] },
      { key: "tryRunRelease", children: [{ key: "pilotRun" }, { key: "performanceTrack" }] },
      { key: "ra" },
      { key: "meetingMinutes" },
      { key: "others" },
    ],
  },
  {
    key: "close",
    children: [
      {
        key: "handover",
        children: [
          { key: "vendorOperationManual" },
          { key: "buyoffDocumentWithVendor" },
          { key: "benefitBuyoff" },
          { key: "sparePartsList" },
        ],
      },
      { key: "photoVideo" },
      { key: "closeMeeting", children: [{ key: "documentArchive" }] },
      { key: "meetingMinutes" },
    ],
  },
  { key: "cip", children: [{ key: "projectLink" }] },
  { key: "afterSales", children: [{ key: "sowQuotationPo" }, { key: "issueSolution" }] },
  { key: "commercial", children: [{ key: "nda" }, { key: "poRecord" }, { key: "invoice" }] },
  { key: "statusUpdate" },
];
