import type { Status, Completion } from "../types";
import "./StatusChip.css";

// ─── Status → color mapping ───────────────────────────────────────────────────
// Status and Completion are distinct taxonomies (see types/index.ts) — they get
// their own color maps so each value stays visually distinguishable.

export const STATUS_COLORS: Record<Status, string> = {
  Wishlist: "var(--apple-pink)",
  Backlog: "var(--apple-blue)",
  Playing: "var(--apple-green)",
  Played: "var(--apple-orange)",
};

export const STATUS_SUBTLE: Record<Status, string> = {
  Wishlist: "var(--apple-pink-subtle)",
  Backlog: "var(--apple-blue-subtle)",
  Playing: "var(--apple-green-subtle)",
  Played: "var(--apple-orange-subtle)",
};

// ─── Completion → color mapping ───────────────────────────────────────────────

export const COMPLETION_COLORS: Record<Completion, string> = {
  Completed: "var(--apple-green)",
  Mastered: "var(--apple-yellow)",
  Abandoned: "var(--apple-red)",
  Shelved: "var(--apple-purple)",
};

export const COMPLETION_SUBTLE: Record<Completion, string> = {
  Completed: "var(--apple-green-subtle)",
  Mastered: "var(--apple-yellow-subtle)",
  Abandoned: "var(--apple-red-subtle)",
  Shelved: "var(--apple-purple-subtle)",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface StatusChipProps {
  label: Status | "All";
  count?: number;
  active: boolean;
  /** Dot color — omit to suppress the dot (e.g. "All" filter) */
  dotColor?: string;
  onClick: () => void;
  /** Suppress the numeric count (standalone label use) */
  hideCount?: boolean;
  /** Compact mode — less horizontal padding */
  compact?: boolean;
}

export function StatusChip({
  label,
  count,
  active,
  dotColor,
  onClick,
  hideCount = false,
  compact = false,
}: StatusChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`status-chip ${active ? "active" : ""} ${compact ? "compact" : ""}`}
    >
      {dotColor && (
        <span aria-hidden="true" className="status-chip-dot" style={{ background: dotColor }} />
      )}
      {label}
      {!hideCount && count !== undefined && <span className="status-chip-count">{count}</span>}
    </button>
  );
}
