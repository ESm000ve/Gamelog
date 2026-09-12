import React, { useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = 470,
  initialFocusRef,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Use existing focus trap hook
  useFocusTrap(isOpen ? dialogRef : { current: null }, isOpen, initialFocusRef);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="modal-panel"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
