"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="w-[min(100%-2rem,32rem)] rounded-lg border border-line bg-paper p-0 shadow-md backdrop:bg-green-950/50"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id={titleId} className="text-h3 text-green-950">
          {title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
          <X className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
          Close
        </Button>
      </div>
      <div className="px-5 py-4 text-body text-ink">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
