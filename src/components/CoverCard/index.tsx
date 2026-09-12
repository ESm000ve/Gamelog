import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { CoverCardProps } from "./types";
import { CoverCardOverlay } from "./CoverCardOverlay";
import { StatusContextMenu, RateContextMenu } from "./CoverCardMenus";
import { CoverCardMetadata } from "./CoverCardMetadata";
import "./CoverCard.css";

export function CoverCard({
  game,
  onClick,
  onChangeStatus,
  onRate,
  onLog,
  selectable,
  selected,
  onToggleSelect,
  tabIndex = 0,
}: CoverCardProps) {
  const [hovered, setHovered] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [rateMenuOpen, setRateMenuOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  // Close dropdowns on click away
  useEffect(() => {
    if (!statusMenuOpen && !rateMenuOpen) return;
    const handle = () => {
      setStatusMenuOpen(false);
      setRateMenuOpen(false);
    };
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, [statusMenuOpen, rateMenuOpen]);

  const fallbackColor = game.coverColor ?? "var(--apple-tertiary-bg)";
  const anyMenuOpen = statusMenuOpen || rateMenuOpen;

  // Single source of truth for hover-revealed quick actions
  const quickActionsVisible = !selectable && (hovered || anyMenuOpen || focusWithin);

  return (
    <div
      className="cover-card-container"
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocusWithin(false);
        }
      }}
    >
      {/* ── Cover tile (3:4 aspect) ── */}
      <div
        role="button"
        tabIndex={tabIndex}
        className={`cover-card-btn ${selected ? "selected" : ""} ${hovered ? "hovered" : ""} ${selectable ? "selectable" : ""}`}
        aria-label={`${game.title}${game.status ? `, Status: ${game.status}` : ""}`}
        style={{
          background: fallbackColor,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (selectable) {
              onToggleSelect?.(game.igdbId, e as unknown as React.MouseEvent);
            } else {
              onClick?.(game.igdbId);
            }
          }
        }}
        onClick={(e) => {
          if (selectable) {
            onToggleSelect?.(game.igdbId, e);
          } else {
            onClick?.(game.igdbId);
          }
        }}
      >
        {/* Cover image */}
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} className="cover-image" draggable={false} />
        ) : (
          <div className="cover-placeholder">
            <span>{game.title}</span>
          </div>
        )}

        {/* Hover overlay with quick actions */}
        <CoverCardOverlay
          igdbId={game.igdbId}
          visible={quickActionsVisible}
          onLog={onLog}
          onOpenStatusMenu={() => {
            setStatusMenuOpen(true);
            setRateMenuOpen(false);
          }}
          onOpenRateMenu={() => {
            setRateMenuOpen(true);
            setStatusMenuOpen(false);
          }}
        />

        {/* Selection checkmark */}
        {selectable && (
          <div
            aria-hidden="true"
            className={`cover-selection-indicator ${selected ? "selected" : "unselected"}`}
          >
            {selected ? <CheckCircle2 size={16} color="white" /> : <Circle size={16} />}
          </div>
        )}

        {/* Deal Badge */}
        {game.dealPrice !== undefined && (
          <a
            href={game.dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="View deal on CheapShark"
            className="cover-deal-badge"
          >
            ${game.dealPrice.toFixed(2)}
          </a>
        )}

        {/* Completion Progress Bar */}
        {(game.completionPercentage ?? 0) > 0 && (
          <div className="cover-progress-bar">
            <div
              className="cover-progress-fill"
              style={{
                width: `${game.completionPercentage}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Context Menus ── */}
      {statusMenuOpen && (
        <StatusContextMenu
          igdbId={game.igdbId}
          onChangeStatus={onChangeStatus}
          onClose={() => setStatusMenuOpen(false)}
        />
      )}

      {rateMenuOpen && (
        <RateContextMenu
          igdbId={game.igdbId}
          rating={game.rating}
          onRate={onRate}
          onClose={() => setRateMenuOpen(false)}
        />
      )}

      {/* ── Metadata below tile ── */}
      <CoverCardMetadata
        platform={game.platform}
        releaseYear={game.releaseYear}
        status={game.status}
        rating={game.rating}
      />
    </div>
  );
}

export type { CoverCardProps, CoverCardGame } from "./types";
