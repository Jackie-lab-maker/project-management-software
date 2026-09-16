"use client";

import { useSyncExternalStore } from "react";
import { projects as seedProjects } from "./mock-data";
import type { Project } from "./types";

/**
 * Client-side project store, backed by localStorage.
 *
 * There is no backend yet (spec §8 describes one; Phase 1 here is frontend
 * only), so "create project" has nowhere durable to write. This is the
 * stopgap: projects created through the form persist in this browser via
 * localStorage and merge with the seed data everywhere projects are listed,
 * so Home/Portfolio/Analytics/the project workspace all agree. It is not a
 * substitute for the transactional server-side counter and database the spec
 * calls for — swap this module for real API calls once that exists.
 */

const STORAGE_KEY = "mdb-created-projects";
// Seed projects are a static import, not a database row, so "delete" can't
// remove them — a tombstone list is the only way to make deletion stick for
// both seed and locally-created projects alike.
const DELETED_KEY = "mdb-deleted-project-ids";

type Listener = () => void;
let listeners: Listener[] = [];
let cache: Project[] | null = null;

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Absent, or corrupted by something other than this module.
    return [];
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing, blocked storage, or quota exceeded: the change still
    // applies for the rest of this session via the in-memory cache, it just
    // won't survive a reload.
  }
}

function computeSnapshot(): Project[] {
  const deleted = new Set(readArray<string>(DELETED_KEY));
  return [...seedProjects, ...readArray<Project>(STORAGE_KEY)].filter((p) => !deleted.has(p.id));
}

function getSnapshot(): Project[] {
  if (cache === null) cache = computeSnapshot();
  return cache;
}

// The server has no localStorage, so its snapshot is the seed data only.
// useSyncExternalStore reconciles this against the client snapshot after
// hydration without a mismatch warning.
function getServerSnapshot(): Project[] {
  return seedProjects;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === DELETED_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Appends a project created through the New Project form. */
export function addCreatedProject(project: Project) {
  const created = readArray<Project>(STORAGE_KEY);
  created.push(project);
  writeJSON(STORAGE_KEY, created);
  cache = null;
  emit();
}

/**
 * Removes a project from every screen in this browser. For a locally-created
 * project this also drops it from the created list so storage doesn't grow
 * unboundedly; a seed project is tombstoned instead, since the seed array
 * itself can't be edited.
 */
export function deleteProject(id: string) {
  const created = readArray<Project>(STORAGE_KEY);
  const stillCreated = created.filter((p) => p.id !== id);
  if (stillCreated.length !== created.length) {
    writeJSON(STORAGE_KEY, stillCreated);
  } else {
    const deleted = readArray<string>(DELETED_KEY);
    if (!deleted.includes(id)) writeJSON(DELETED_KEY, [...deleted, id]);
  }
  cache = null;
  emit();
}

/** All projects — seed data plus anything created in this browser. */
export function useProjects(): Project[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProject(id: string): Project | undefined {
  return useProjects().find((p) => p.id === id);
}
