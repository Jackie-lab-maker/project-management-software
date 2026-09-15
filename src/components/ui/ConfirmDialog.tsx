"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Button, MonoLabel } from "./primitives";

export function ConfirmDialog({
  open,
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Confirming or cancelling is the only way out: no click-outside-to-close,
  // so a stray click can't discard a destructive decision either way. Escape
  // is treated as cancel, and focus starts on Cancel so keyboard/Enter never
  // lands on the destructive action by default.
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm border border-line bg-surface"
      >
        <div className="border-b border-line p-6">
          <MonoLabel tone="accent">{label}</MonoLabel>
          <h2 id="confirm-dialog-title" className="mt-2 text-[19px] leading-snug">
            {title}
          </h2>
          <p id="confirm-dialog-description" className="mt-2.5 text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        </div>
        <div className="flex gap-2.5 p-6">
          <Button ref={cancelRef} variant="secondary" className="flex-1" onClick={onCancel}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
