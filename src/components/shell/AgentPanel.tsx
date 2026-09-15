"use client";

import { useState } from "react";
import { agentThread } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { AgentMessage } from "@/lib/types";
import { Button, MonoLabel, cx } from "@/components/ui/primitives";

function Citations({ message }: { message: AgentMessage }) {
  const { t } = useLanguage();
  if (!message.citations?.length) return null;
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <MonoLabel>{t.agent.sources}</MonoLabel>
      <ul className="space-y-1.5">
        {message.citations.map((c) => (
          <li key={c.knowledgeId}>
            <a
              href={`/knowledge#${c.knowledgeId}`}
              className="group flex items-baseline gap-2 text-xs text-muted transition-colors hover:text-accent"
            >
              <span className="mono-label shrink-0 text-accent">{c.knowledgeId}</span>
              <span className="leading-relaxed">
                {c.title}
                <span className="text-faint">
                  {" "}
                  · {c.revision} · effective {c.effectiveDate}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Every state-changing action is previewed and gated behind explicit confirmation. */
function ActionPreview({ message }: { message: AgentMessage }) {
  const { t } = useLanguage();
  const [state, setState] = useState<"pending" | "confirmed" | "discarded">("pending");
  const action = message.proposedAction;
  if (!action) return null;

  if (state !== "pending") {
    return (
      <div className="mt-3 border border-line bg-sunken p-3">
        <MonoLabel tone={state === "confirmed" ? "accent" : "faint"}>
          {state === "confirmed" ? t.agent.actionConfirmed : t.agent.actionDiscarded}
        </MonoLabel>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-accent/35 bg-accent-wash">
      <div className="border-b border-accent/25 px-3 py-2">
        <MonoLabel tone="accent">{t.agent.proposedChange}</MonoLabel>
        <p className="mt-1.5 text-xs leading-relaxed text-ink">{action.summary}</p>
      </div>
      <dl className="divide-y divide-line/70">
        {action.changes.map((c) => (
          <div key={c.field} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2">
            <dt className="mono-label text-muted">{c.field}</dt>
            <dd className="text-right text-xs text-ink">
              <span className="text-faint line-through">{c.from}</span>{" "}
              <span aria-hidden className="text-faint">
                →
              </span>{" "}
              {c.to}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2 border-t border-accent/25 p-3">
        <Button className="px-3 py-1.5 text-xs" onClick={() => setState("confirmed")}>
          {t.agent.confirmAndApply}
        </Button>
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setState("discarded")}>
          {t.agent.discard}
        </Button>
      </div>
    </div>
  );
}

function Message({ message }: { message: AgentMessage }) {
  const { t } = useLanguage();
  const isUser = message.author === "user";
  return (
    <article className={cx("border-b border-line px-5 py-4", isUser && "bg-sunken")}>
      <MonoLabel tone={isUser ? "faint" : "accent"} className="mb-2">
        {isUser ? t.agent.you : t.agent.name}
      </MonoLabel>
      <div className="space-y-2 text-[13px] leading-relaxed text-text">
        {message.text.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <Citations message={message} />
      <ActionPreview message={message} />
    </article>
  );
}

export function AgentPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");

  return (
    <aside
      aria-label={t.agent.panelAria}
      aria-hidden={!open}
      className={cx(
        "fixed inset-y-0 right-0 z-40 flex w-[380px] max-w-full flex-col border-l border-line bg-surface transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <MonoLabel tone="accent">{t.agent.aiOperationsAgent}</MonoLabel>
          <h2 className="mt-1 text-[17px] leading-tight">{t.agent.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label={t.nav.closeAgentPanel}
          className="flex size-7 items-center justify-center border border-line text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <span aria-hidden>✕</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {agentThread.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      <form
        className="border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
      >
        <label htmlFor="agent-input" className="sr-only">
          {t.agent.askAgent}
        </label>
        <textarea
          id="agent-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder={t.agent.inputPlaceholder}
          className="w-full resize-none border border-line bg-bg px-3 py-2.5 text-[13px] text-text placeholder:text-faint focus:border-ink focus:outline-none"
        />
        <div className="mt-2.5 flex items-center justify-between">
          <MonoLabel>{t.agent.citeNote}</MonoLabel>
          <Button type="submit" className="px-3 py-1.5 text-xs" disabled={!draft.trim()}>
            {t.agent.send}
          </Button>
        </div>
      </form>
    </aside>
  );
}
