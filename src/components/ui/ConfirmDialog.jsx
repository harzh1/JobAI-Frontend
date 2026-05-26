import React, { useEffect, useRef } from "react";
import { AlertCircle } from "./AppIcons";
import { Button } from "./UIComponents";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger", // "danger" | "primary"
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl bg-white dark:bg-[var(--surface-bg)] border border-[#e1e5ea] dark:border-[#333538]/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              variant === "danger"
                ? "bg-red-50 dark:bg-red-500/10"
                : "bg-[#3442FF]/10 dark:bg-[#3442FF]/20"
            }`}
          >
            <AlertCircle
              size={24}
              className={
                variant === "danger"
                  ? "text-red-500"
                  : "text-[#3442FF]"
              }
            />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {title}
          </h3>

          {description && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
