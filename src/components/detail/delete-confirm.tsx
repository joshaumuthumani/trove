"use client";
/* Trove — delete confirmation dialog. Focus is moved in, Tab is trapped, Escape
   cancels, and focus is restored to the trigger on close. Ported from
   detail.jsx DeleteConfirm. */
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export function DeleteConfirm({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const modal = modalRef.current;
    if (!modal) return;
    const focusables = () =>
      [...modal.querySelectorAll<HTMLElement>('button,[href],input,[tabindex]:not([tabindex="-1"])')].filter(
        (el) => !(el as HTMLButtonElement).disabled
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && (i === f.length - 1 || i === -1)) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [onCancel]);

  return (
    <div className="modal-scrim" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Delete ${title}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon modal-icon--danger">
          <Icon name="trash" size={20} />
        </div>
        <h3>Delete “{title}”?</h3>
        <p>This removes it from your Trove. You can’t undo this.</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" icon="trash" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
