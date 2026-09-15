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

type Listener = () => void;
let listeners: Listener[] = [];
let cache: Project[] | null = null;

function readCreated(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Project[]) : [];
  } catch {
    return [];
  }
}

function writeCreated(list: Project[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Private browsing, blocked storage, or quota exceeded: the project still
    // renders for the rest of this session via the in-memory cache, it just
    // won't survive a reload.
  }
}

function getSnapshot(): Project[] {
  if (cache === null) cache = [...seedProjects, ...readCreated()];
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
    if (e.key === STORAGE_KEY) {
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
  const created = readCreated();
  created.push(project);
  writeCreated(created);
  cache = [...seedProjects, ...created];
  emit();
}

/** All projects — seed data plus anything created in this browser. */
export function useProjects(): Project[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProject(id: string): Project | undefined {
  return useProjects().find((p) => p.id === id);
}
