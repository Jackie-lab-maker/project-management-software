"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MonoLabel, StatusBadge, cx } from "@/components/ui/primitives";
import { daysUntil, formatDate } from "@/lib/metrics";
import type { ApprovalState, KnowledgeCategory, KnowledgeItem } from "@/lib/types";

const CATEGORIES: KnowledgeCategory[] = [
  "SOP",
  "BKM",
  "FAT",
  "SAT",
  "Buy-off",
  "Lessons Learned",
  "Vendor Documents",
  "Meeting Minutes",
  "Design Documents",
];

const STATES: ApprovalState[] = ["Draft", "In Review", "Approved", "Superseded"];

const stateTone = (state: ApprovalState) =>
  state === "Approved" ? "ok" : state === "In Review" ? "warn" : "none";

export function KnowledgeBrowser({ items }: { items: KnowledgeItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory | "">("");
  const [state, setState] = useState<ApprovalState | "">("");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const haystack = `${item.id} ${item.title} ${item.summary} ${item.tags.join(" ")} ${item.owner}`.toLowerCase();
        if (query && !haystack.includes(query.toLowerCase())) return false;
        if (category && item.category !== category) return false;
        if (state && item.state !== state) return false;
        return true;
      }),
    [items, query, category, state],
  );

  const countFor = (cat: KnowledgeCategory) => items.filter((i) => i.category === cat).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      {/* Facets */}
      <aside className="space-y-8 border-b border-line p-6 lg:sticky lg:top-[57px] lg:self-start lg:border-r lg:border-b-0 lg:p-8">
        <div className="space-y-2">
          <label htmlFor="knowledge-search" className="mono-label block">
            Search
          </label>
          <input
            id="knowledge-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, tag, owner…"
            className="w-full border border-line bg-bg px-3 py-2 text-sm text-text placeholder:text-faint focus:border-ink focus:outline-none"
          />
          <p className="text-[12px] text-muted">Full-text and semantic search across permitted content.</p>
        </div>

        <div className="space-y-3">
          <MonoLabel>Category</MonoLabel>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => setCategory("")}
                className={cx(
                  "flex w-full items-center justify-between py-1 text-left text-[13px] transition-colors",
                  category === "" ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                All categories
                <span className="tnum text-[12px] text-faint">{items.length}</span>
              </button>
            </li>
            {CATEGORIES.map((cat) => {
              const count = countFor(cat);
              return (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    disabled={count === 0}
                    className={cx(
                      "flex w-full items-center justify-between py-1 text-left text-[13px] transition-colors disabled:opacity-40",
                      category === cat ? "text-accent" : "text-muted hover:text-ink",
                    )}
                  >
                    {cat}
                    <span className="tnum text-[12px] text-faint">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <MonoLabel>Approval state</MonoLabel>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState("")}
              className={cx(
                "border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
                state === "" ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink",
              )}
            >
              All
            </button>
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={cx(
                  "border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors",
                  state === s ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between border-b border-line px-6 py-4 lg:px-8">
          <MonoLabel>
            {filtered.length} of {items.length} items
          </MonoLabel>
          <MonoLabel>Approved revisions only in Jason context</MonoLabel>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-20 text-center lg:px-8">
            <MonoLabel className="mb-3">No matches</MonoLabel>
            <p className="text-[15px] text-muted">Nothing matches these facets. Clear a filter or widen the search.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((item) => {
              const untilReview = daysUntil(item.reviewDate);
              return (
                <li key={item.id} id={item.id} className="border-b border-line">
                  <article className="px-6 py-6 transition-colors duration-200 hover:bg-surface-hover lg:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <MonoLabel>
                          <span className="text-accent">{item.id}</span> · {item.category} · {item.revision}
                        </MonoLabel>
                        <h2 className="text-[18px] leading-snug">{item.title}</h2>
                      </div>
                      <StatusBadge tone={stateTone(item.state)}>{item.state}</StatusBadge>
                    </div>

                    <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted">{item.summary}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="mono-label">Owner {item.owner}</span>
                      <span className="mono-label">Effective {formatDate(item.effectiveDate)}</span>
                      <span className={cx("mono-label", untilReview < 210 && "text-warn")}>
                        Review {formatDate(item.reviewDate)}
                        {untilReview < 210 && ` · ${untilReview}d`}
                      </span>
                      {item.projectId && (
                        <Link
                          href={`/projects/${item.projectId}`}
                          className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase hover:text-accent-hover"
                        >
                          {item.projectId} →
                        </Link>
                      )}
                    </div>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border border-line px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
