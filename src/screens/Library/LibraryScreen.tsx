import { useState, useEffect } from "react";
import { Search, ChevronDown, BookOpen, Plus, Grid2x2, List, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CoverCard } from "../../components/CoverCard";
import { LibraryTableView } from "./LibraryTableView";
import { ShareListModal } from "../../components/ShareListModal";
import { useLibrary, useLibraryCounts, type SortKey } from "../../hooks/useLibrary";
import { useLiveRegion } from "../../hooks/useLiveRegion";
import { LogsRepo } from "../../db/repositories";
import { FilterBar, ActiveFilterBadges } from "../../components/FilterBar";
import type { FilterSpec } from "../../services/filterEngine";
import { fetchDealsForWishlist } from "../../services/priceTracker";
import { SpotlightBanner } from "../../components/SpotlightBanner";
import { Button } from "../../components/ui/Button";
import type { Status } from "../../types";
import "./LibraryScreen.css";

// ─── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "rating", label: "Rating" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "year-desc", label: "Release year (newest first)" },
  { value: "year-asc", label: "Release year (oldest first)" },
  { value: "time", label: "Time played" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function LibraryScreen({
  onAddGame,
  onOpenLog,
  onOpenGame,
}: {
  onAddGame?: () => void;
  onOpenLog?: (igdbId: number) => void;
  onOpenGame?: (igdbId: number) => void;
}) {
  const [filterSpec, setFilterSpec] = useState<FilterSpec>({});
  const [sort, setSort] = useState<SortKey>("year-asc");
  const [sortOpen, setSortOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    return (localStorage.getItem("libraryViewMode") as any) || "grid";
  });

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("libraryViewMode", mode);
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Close sort menu on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const handle = () => setSortOpen(false);
    window.addEventListener("click", handle);
    return () => window.removeEventListener("click", handle);
  }, [sortOpen]);

  const navigate = useNavigate();
  const entries = useLibrary({ filters: filterSpec, sort, search: debouncedSearch });
  const counts = useLibraryCounts();
  const { announce } = useLiveRegion();

  useEffect(() => {
    if (entries !== undefined) {
      announce(`Showing ${entries.length} games`);
    }
  }, [entries?.length, announce]);

  useEffect(() => {
    if (
      filterSpec.status &&
      filterSpec.status.includes("Wishlist") &&
      entries &&
      entries.length > 0
    ) {
      const games = entries.map((e) => e.game);
      fetchDealsForWishlist(games);
    }
  }, [entries, filterSpec.status]);

  const totalCount = counts?.All ?? 0;
  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)!;

  const handleStatusChange = async (igdbId: number, status: Status) => {
    await LogsRepo.updateStatus(igdbId, status);
  };

  const handleRate = async (igdbId: number, status: Status, rating: number) => {
    await LogsRepo.save(igdbId, { status, rating });
  };

  return (
    <main id="main-content" className="library-screen">
      {/* ── Toolbar ── */}
      <div className="library-toolbar glass-panel">
        <div className="library-toolbar-title">
          <h1 className="text-display">Library</h1>
          <span className="text-muted">
            {totalCount} {totalCount === 1 ? "game" : "games"}
          </span>
        </div>

        <div className="library-toolbar-actions"></div>
      </div>

      {/* ── Filter strip ── */}
      <div className="library-filter-strip">
        <div className="library-search-container">
          <div className="library-search-input">
            <Search
              size={13}
              color="var(--apple-tertiary-label)"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Filter library"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter library"
            />
          </div>
          <ActiveFilterBadges spec={filterSpec} onChange={setFilterSpec} />
        </div>

        <div className="library-actions-container">
          {/* Share button */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            title="Share & Export Library"
            aria-label="Share & Export Library"
            className="library-btn-outline"
          >
            <Share2 size={14} color="var(--apple-accent)" aria-hidden="true" />
            Share
          </button>

          {/* View mode toggle */}
          <div className="library-view-toggle">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              aria-label="Grid view"
              style={{
                background: viewMode === "grid" ? "var(--apple-accent)" : "transparent",
                color: viewMode === "grid" ? "var(--apple-white)" : "var(--apple-secondary-label)",
              }}
            >
              <Grid2x2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              aria-label="Table view"
              style={{
                background: viewMode === "table" ? "var(--apple-accent)" : "transparent",
                color: viewMode === "table" ? "var(--apple-white)" : "var(--apple-secondary-label)",
              }}
            >
              <List size={15} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSortOpen((v) => !v);
              }}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-label={`Sort: ${currentSort.label}`}
              className="library-sort-btn"
              style={{
                background: sortOpen ? "var(--apple-accent)" : "var(--apple-fill)",
                color: sortOpen ? "white" : "var(--apple-label)",
              }}
              onMouseEnter={(e) => {
                if (!sortOpen) e.currentTarget.style.background = "var(--apple-secondary-fill)";
              }}
              onMouseLeave={(e) => {
                if (!sortOpen) e.currentTarget.style.background = "var(--apple-fill)";
              }}
            >
              Sort: {currentSort.label}
              <ChevronDown size={13} color="var(--apple-tertiary-label)" aria-hidden="true" />
            </button>

            {sortOpen && (
              <>
                {/* Click-away trap */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={() => setSortOpen(false)}
                />
                <div
                  role="listbox"
                  aria-label="Sort by"
                  onKeyDown={(e) => {
                    const options = SORT_OPTIONS;
                    const currentIdx = options.findIndex((o) => o.value === sort);
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const next = options[(currentIdx + 1) % options.length];
                      setSort(next.value);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prev = options[(currentIdx - 1 + options.length) % options.length];
                      setSort(prev.value);
                    } else if (e.key === "Escape") {
                      setSortOpen(false);
                    }
                  }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    zIndex: 100,
                    background: "var(--apple-tertiary-bg)",
                    border: "1px solid var(--apple-separator)",
                    borderRadius: "var(--radius-xl)",
                    minWidth: 176,
                    padding: "var(--space-1) 0",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.05)",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={opt.value === sort}
                      tabIndex={0}
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSort(opt.value);
                          setSortOpen(false);
                        }
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "7px 14px",
                        minHeight: 44,
                        fontSize: "var(--font-size-base)",
                        fontWeight: opt.value === sort ? 500 : 400,
                        color: opt.value === sort ? "var(--apple-accent)" : "var(--apple-label)",
                        background: "transparent",
                        border: "none",
                        transition: "background 80ms ease",
                        textAlign: "left",
                        cursor: "pointer",
                        lineHeight: "44px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--apple-fill)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <FilterBar spec={filterSpec} onChange={setFilterSpec} />
        </div>
      </div>

      {/* ── Cover grid ── */}
      <div className="library-content-area">
        <SpotlightBanner />

        <div style={{ padding: "0 var(--space-8)" }}>
          {/* Loading */}
          {entries === undefined && (
            <div className="flex-center" style={{ minHeight: 300 }}>
              <span className="text-muted">Loading…</span>
            </div>
          )}

          {/* Empty state */}
          {entries !== undefined && entries.length === 0 && (
            <EmptyState
              hasSearch={!!search.trim() || Object.keys(filterSpec).length > 0}
              hasFilter={filterSpec.status !== undefined && filterSpec.status.length > 0}
              filter={filterSpec.status?.[0] || "All"}
              search={search}
              onAddGame={onAddGame}
            />
          )}

          {/* Grid or Table View */}
          {entries !== undefined &&
            entries.length > 0 &&
            (viewMode === "table" ? (
              <LibraryTableView
                entries={entries}
                onOpenGame={onOpenGame ? (id) => onOpenGame(id) : (id) => navigate(`/game/${id}`)}
                onOpenLog={onOpenLog}
                sortKey={sort}
                onSortChange={setSort}
              />
            ) : (
              <div className="library-grid">
                {entries.map(({ game, log }) => (
                  <CoverCard
                    key={game.igdbId}
                    game={{
                      ...game,
                      status: log.status,
                      rating: log.rating,
                      platform: log.platform || game.platforms?.[0],
                      completionPercentage: log.completionPercentage,
                    }}
                    onClick={(id) => (onOpenGame ? onOpenGame(id) : navigate(`/game/${id}`))}
                    onChangeStatus={handleStatusChange}
                    onRate={(id, r) => handleRate(id, log.status, r)}
                    onLog={onOpenLog ? () => onOpenLog(game.igdbId) : undefined}
                  />
                ))}
              </div>
            ))}
        </div>

        {/* Share Modal */}
        <ShareListModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title="My Game Library"
          entries={entries || []}
        />
      </div>
    </main>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  hasSearch,
  hasFilter,
  filter,
  search,
  onAddGame,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
  filter: Status | "All";
  search: string;
  onAddGame?: () => void;
}) {
  const title = hasSearch
    ? `No results for "${search}"`
    : hasFilter
      ? `Nothing in ${filter} yet`
      : "Your library is empty";

  const sub = hasSearch
    ? "Try a different title or clear your search."
    : "Start tracking your games by adding one.";

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        {hasSearch || hasFilter ? (
          <Search size={20} color="var(--apple-tertiary-label)" />
        ) : (
          <BookOpen size={20} color="var(--apple-tertiary-label)" />
        )}
      </div>
      <div className="flex-col" style={{ alignItems: "center", gap: 4 }}>
        <p className="text-body" style={{ fontWeight: 500 }}>
          {title}
        </p>
        <p className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
          {sub}
        </p>
      </div>
      {!hasSearch && !hasFilter && onAddGame && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAddGame}
          className="hover-scale"
          style={{
            padding: "7px var(--space-4)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--font-size-base)",
            fontWeight: 500,
          }}
        >
          <Plus size={13} />
          Add game
        </Button>
      )}
    </div>
  );
}
