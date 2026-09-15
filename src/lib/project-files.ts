/**
 * The project file taxonomy. The first layer is fixed and identical across
 * every project — it mirrors the project lifecycle, so a document's place in
 * the tree is itself a statement about which phase produced it.
 *
 * Folders are keyed rather than named here: the display name comes from
 * translations.ts (project.files.folders) so the tree reads in the viewer's
 * language while the key stays stable as a storage path segment.
 *
 * Subfolders attach as `children` — the renderer already walks them, so
 * deepening the tree is a change to this file alone.
 */
export interface ProjectFolder {
  key: string;
  children?: ProjectFolder[];
}

export const PROJECT_FOLDERS: ProjectFolder[] = [
  { key: "initial" },
  { key: "designing" },
  { key: "implementation" },
  { key: "close" },
  { key: "cip" },
  { key: "afterSales" },
  { key: "commercial" },
  { key: "statusUpdate" },
];
