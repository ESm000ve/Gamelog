import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  Flag,
  Trophy,
  Edit3,
  Plus,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { Button } from "../../components/ui/Button";
import { GamesRepo } from "../../db/repositories/GamesRepo";
import { LogsRepo } from "../../db/repositories";
import { useGameDetail } from "../../hooks/useGameDetail";
import { StarRating } from "../../components/StarRating";
import { STATUS_COLORS, STATUS_SUBTLE } from "../../components/StatusChip";
import { RelatedStrip } from "./RelatedStrip";
import { Skeleton } from "../../components/Skeleton";
import { useSimilarLibraryGames } from "../../hooks/useSimilarLibraryGames";
import { TagsRepo } from "../../db/repositories/TagsRepo";
import type { Game, Log, Tag as TagType } from "../../types";
import type { CatalogGame } from "../../catalog/types";
import "./GameDetail.css";

// ─── Tab config ───────────────────────────────────────────────────────────────

type RelatedTabKey = "related" | "dlcs" | "expansions" | "ports" | "series" | "mods" | "bundles";
const TAB_LABELS: Record<RelatedTabKey, string> = {
  related: "Related",
  dlcs: "DLC",
  expansions: "Expansions",
  ports: "Ports",
  series: "Series",
  mods: "Mods",
  bundles: "In bundles",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

interface GameDetailScreenProps {
  onOpenLog: (igdbId: number) => void;
  onOpenGame: (igdbId: number) => void;
  onOpenAddToList?: (igdbId: number, title: string) => void;
}

export function GameDetailScreen({
  onOpenLog,
  onOpenGame,
  onOpenAddToList,
}: GameDetailScreenProps) {
  const { igdbId: igdbIdStr } = useParams<{ igdbId: string }>();
  const navigate = useNavigate();
  const igdbId = igdbIdStr ? parseInt(igdbIdStr, 10) : null;

  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { detail, loading, error, retry } = useGameDetail(igdbId);
  const similarLibraryGames = useSimilarLibraryGames(detail);

  // Live library state for THIS game
  const libraryEntry = useLiveQuery(async () => {
    if (!igdbId) return null;
    const [game, log] = await Promise.all([db.games.get(igdbId), db.logs.get(igdbId)]);
    if (!game || !log) return null;
    return { game, log } as { game: Game; log: Log };
  }, [igdbId]);

  // ── Back nav ────────────────────────────────────────────────────────────────
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // ── Add to library (not-in-library CTA) ────────────────────────────────────
  const handleAddAndLog = async () => {
    if (!detail || !igdbId) return;
    const catalogGame: CatalogGame = {
      igdbId: detail.igdbId,
      title: detail.title,
      slug: detail.slug,
      developer: detail.developer ?? "Unknown",
      publisher: detail.publisher,
      releaseYear: detail.releaseYear,
      firstReleaseDate: detail.firstReleaseDate,
      summary: detail.summary,
      genres: detail.genres,
      platforms: detail.platforms,
      coverUrl: detail.coverUrl,
      timeToBeat: detail.timeToBeat ?? undefined,
      igdbRating: detail.igdbRating?.score,
    };
    await GamesRepo.addFromCatalog(catalogGame, "Backlog");
    onOpenLog(igdbId);
  };

  // ── Quick Log Session ───────────────────────────────────────────────────────
  const handleQuickLogSession = async () => {
    if (!igdbId) return;
    await LogsRepo.logSession(igdbId);
  };

  // ── Related tabs — only show tabs with entries ──────────────────────────────
  const allTabs: RelatedTabKey[] = [
    "related",
    "dlcs",
    "expansions",
    "ports",
    "series",
    "mods",
    "bundles",
  ];
  const activeTabs = detail ? allTabs.filter((k) => (detail.related[k]?.length ?? 0) > 0) : [];
  const [activeRelTab, setActiveRelTab] = useState<RelatedTabKey | null>(null);
  const currentRelTab = activeRelTab ?? activeTabs[0] ?? null;

  // ── Tags ────────────────────────────────────────────────────────────────────
  const [allTags, setAllTags] = useState<TagType[]>([]);
  useState(() => {
    TagsRepo.getAll().then(setAllTags);
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ScreenShell onBack={goBack} title="">
        <div className="game-detail-body">
          <h1 className="sr-only">Loading game details</h1>
          <div className="game-detail-skeleton-hero">
            <Skeleton
              width={160}
              height={213}
              borderRadius="var(--radius-xl)"
              style={{ flexShrink: 0 }}
            />
            <div className="game-detail-skeleton-hero-meta">
              <Skeleton width="60%" height={32} borderRadius="var(--radius-sm)" />
              <div className="game-detail-skeleton-meta-pills">
                <Skeleton width={80} height={20} borderRadius="var(--radius-sm)" />
                <Skeleton width={80} height={20} borderRadius="var(--radius-sm)" />
                <Skeleton width={80} height={20} borderRadius="var(--radius-sm)" />
              </div>
              <Skeleton width="100%" height={80} borderRadius="var(--radius-sm)" />
            </div>
          </div>
          <div className="game-detail-skeleton-body">
            <Skeleton width="100%" height={120} borderRadius="var(--radius-xl)" />
            <Skeleton width="100%" height={120} borderRadius="var(--radius-xl)" />
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (error || !detail) {
    return (
      <ScreenShell onBack={goBack} title="">
        <div className="game-detail-error">
          <AlertCircle size={24} color="var(--apple-red)" />
          <h1>{error ?? "Game not found."}</h1>
          <Button variant="secondary" onClick={retry} style={{ marginTop: "var(--space-2)" }}>
            Retry
          </Button>
        </div>
      </ScreenShell>
    );
  }

  const inLibrary = !!libraryEntry;
  const log = libraryEntry?.log;

  return (
    <ScreenShell onBack={goBack} title={detail.title}>
      <div className="game-detail-body">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="game-detail-hero">
          {/* Left: cover + Add to list */}
          <div className="game-detail-cover-col">
            <div className="game-detail-cover">
              {detail.coverUrl ? (
                <img src={detail.coverUrl} alt={detail.title} />
              ) : (
                <div className="game-detail-cover-placeholder">
                  <span>{detail.title}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                onOpenAddToList
                  ? onOpenAddToList(detail.igdbId, detail.title)
                  : alert("List picker coming in Step 6")
              }
              style={{ width: "100%", color: "var(--apple-secondary-label)" }}
            >
              <Plus size={13} /> Add to list
            </Button>
          </div>

          {/* Right: metadata */}
          <div className="game-detail-meta">
            <h1 className="game-detail-title">{detail.title}</h1>
            <p className="game-detail-developer">
              {detail.companies.find((c) => c.roles.includes("Developer"))?.name ||
                "Unknown Developer"}
              {detail.releaseYear ? ` · ${detail.releaseYear}` : ""}
            </p>

            {/* Ratings */}
            {(detail.igdbRating.score || detail.criticRating.score) && (
              <div className="game-detail-ratings">
                {detail.igdbRating.score && (
                  <div className="game-detail-rating-badge">
                    <div
                      className="game-detail-rating-score"
                      style={{ background: "var(--apple-accent)" }}
                    >
                      {detail.igdbRating.score}
                    </div>
                    <div className="game-detail-rating-info">
                      <span className="game-detail-rating-label">User Score</span>
                      <span className="game-detail-rating-count">
                        {detail.igdbRating.count ?? 0} ratings
                      </span>
                    </div>
                  </div>
                )}
                {detail.criticRating.score && (
                  <div className="game-detail-rating-badge">
                    <div
                      className="game-detail-rating-score"
                      style={{ background: "var(--apple-orange)" }}
                    >
                      {detail.criticRating.score}
                    </div>
                    <div className="game-detail-rating-info">
                      <span className="game-detail-rating-label">Critic Score</span>
                      <span className="game-detail-rating-count">
                        {detail.criticRating.count ?? 0} reviews
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="game-detail-tags">
              <span className="game-detail-tags-label">Genres</span>
              {detail.genres.map((g) => (
                <span key={g} className="game-detail-tag">
                  {g}
                </span>
              ))}
              {log?.tagIds?.map((tid) => {
                const t = allTags.find((x) => x.id === tid);
                if (!t) return null;
                return (
                  <span key={t.id} className="game-detail-tag">
                    {t.name}
                  </span>
                );
              })}
            </div>

            {/* Summary */}
            {detail.summary && (
              <div style={{ marginBottom: "var(--space-3)" }}>
                <ExpandableText text={detail.summary} />
              </div>
            )}

            {/* Storyline */}
            {detail.storyline && (
              <div style={{ marginBottom: "var(--space-4)" }}>
                <h3
                  className="game-detail-section-title"
                  style={{ marginBottom: "var(--space-1)" }}
                >
                  Storyline
                </h3>
                <ExpandableText text={detail.storyline} />
              </div>
            )}
          </div>
        </div>

        {/* ── Time to Beat ─────────────────────────────────────────────────── */}
        {detail.timeToBeat &&
          (detail.timeToBeat.average || detail.timeToBeat.finish || detail.timeToBeat.master) && (
            <Section title="Time to Beat">
              <div className="game-detail-ttb">
                {detail.timeToBeat.average !== undefined && (
                  <div className="game-detail-ttb-item">
                    <Clock size={14} color="var(--apple-tertiary-label)" />
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-label)",
                        fontWeight: 600,
                      }}
                    >
                      {detail.timeToBeat.average}h
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-secondary-label)",
                      }}
                    >
                      Average
                    </span>
                  </div>
                )}
                {detail.timeToBeat.finish !== undefined && (
                  <div className="game-detail-ttb-item">
                    <Flag size={14} color="var(--apple-tertiary-label)" />
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-label)",
                        fontWeight: 600,
                      }}
                    >
                      {detail.timeToBeat.finish}h
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-secondary-label)",
                      }}
                    >
                      To finish
                    </span>
                  </div>
                )}
                {detail.timeToBeat.master !== undefined && (
                  <div className="game-detail-ttb-item">
                    <Trophy size={14} color="var(--apple-tertiary-label)" />
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-label)",
                        fontWeight: 600,
                      }}
                    >
                      {detail.timeToBeat.master}h
                    </span>
                    <span
                      style={{
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-secondary-label)",
                      }}
                    >
                      To master
                    </span>
                  </div>
                )}
              </div>
            </Section>
          )}

        {/* ── Log card / CTA ───────────────────────────────────────────────── */}
        {inLibrary && log ? (
          <Section title="Your Log">
            <div className="game-detail-log-card">
              <div className="game-detail-log-status-row">
                <StatusBadge status={log.status} />
                {log.completion && (
                  <span className="game-detail-log-completion">· {log.completion}</span>
                )}
              </div>
              {log.rating !== undefined && <StarRating rating={log.rating} size={14} showValue />}
              <div className="game-detail-log-meta">
                {log.platforms && log.platforms.length > 0 ? (
                  <MetaItem
                    label={log.platforms.length > 1 ? "Platforms" : "Platform"}
                    value={log.platforms.join(", ")}
                  />
                ) : log.platform ? (
                  <MetaItem label="Platform" value={log.platform} />
                ) : null}
                {log.timePlayed !== undefined && (
                  <MetaItem label="Time played" value={`${log.timePlayed}h`} />
                )}
                {log.startedAt && <MetaItem label="Started" value={log.startedAt} />}
                {log.finishedAt && <MetaItem label="Finished" value={log.finishedAt} />}
              </div>
              {log.notes && <p className="game-detail-log-notes">{log.notes}</p>}
              <div className="game-detail-log-actions">
                {(log.status === "Playing" || log.status === "Played") && (
                  <Button variant="outline" onClick={handleQuickLogSession}>
                    <Plus size={13} /> Quick log session
                  </Button>
                )}
                <Button variant="primary" onClick={() => onOpenLog(igdbId!)}>
                  <Edit3 size={13} /> Edit log
                </Button>
              </div>
            </div>
          </Section>
        ) : (
          <Section title="Log this game">
            <div className="game-detail-add-cta">
              <p
                style={{
                  color: "var(--apple-tertiary-label)",
                  fontSize: "var(--font-size-base)",
                  textAlign: "center",
                }}
              >
                This game isn't in your library yet.
              </p>
              <Button variant="primary" size="lg" onClick={handleAddAndLog}>
                <Plus size={14} /> Add to library &amp; log
              </Button>
            </div>
          </Section>
        )}

        {/* ── Details ─────────────────────────────────────────────────── */}
        {(detail.companies.length > 0 ||
          detail.gameModes.length > 0 ||
          detail.formattedMultiplayer?.length > 0 ||
          detail.playerPersp.length > 0 ||
          detail.ageRatings.length > 0 ||
          detail.franchise ||
          detail.engines.length > 0) && (
          <Section title="Details">
            <div>
              {(() => {
                const groupedRoles = detail.companies.reduce(
                  (acc, c) => {
                    c.roles.forEach((role) => {
                      if (!acc[role]) acc[role] = [];
                      acc[role].push(c.name);
                    });
                    return acc;
                  },
                  {} as Record<string, string[]>
                );
                return Object.entries(groupedRoles).map(([role, companies]) => (
                  <DetailRow key={role} label={role} value={companies.join(", ")} />
                ));
              })()}
              {detail.engines.length > 0 && (
                <DetailRow label="Engine" value={detail.engines.join(", ")} />
              )}
              {detail.gameModes.length > 0 && (
                <DetailRow label="Game modes" value={detail.gameModes.join(", ")} />
              )}
              {detail.formattedMultiplayer?.length > 0 && (
                <DetailRow label="Multiplayer" value={detail.formattedMultiplayer.join("; ")} />
              )}
              {detail.playerPersp.length > 0 && (
                <DetailRow label="Perspective" value={detail.playerPersp.join(", ")} />
              )}
              {detail.ageRatings.length > 0 && (
                <DetailRow label="Age rating" value={detail.ageRatings.join(" · ")} />
              )}
              {detail.ageDescriptors.length > 0 && (
                <DetailRow label="Content" value={detail.ageDescriptors.join(", ")} />
              )}
              {detail.altNames.length > 0 && (
                <DetailRow
                  label="Alt names"
                  value={detail.altNames.map((a) => a.name).join(", ")}
                />
              )}
              {detail.franchise && (
                <DetailRow
                  label="Franchise"
                  value={detail.franchise}
                  onValueClick={() => navigate(`/game/${igdbId}/related?tab=series`)}
                />
              )}
            </div>
          </Section>
        )}

        {/* ── Media ─────────────────────────────────────────────────────────── */}
        {(detail.screenshots.length > 0 ||
          detail.artworks.length > 0 ||
          detail.videos.length > 0) && (
          <Section title="Media">
            <div className="game-detail-media-row">
              {detail.videos.map((v) => (
                <div
                  key={v.videoId}
                  className="game-detail-media-item"
                  style={{ background: "black" }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${v.videoId}`}
                    title={v.name}
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ))}
              {detail.screenshots.map((s) => (
                <div
                  key={s.url}
                  className="game-detail-media-item clickable"
                  style={{ background: "var(--apple-tertiary-bg)" }}
                  onClick={() => setLightboxImg(s.url)}
                >
                  <img src={s.url} alt="Screenshot" loading="lazy" />
                </div>
              ))}
              {detail.artworks.map((a) => (
                <div
                  key={a.url}
                  className="game-detail-media-item clickable"
                  style={{ background: "var(--apple-tertiary-bg)" }}
                  onClick={() => setLightboxImg(a.url)}
                >
                  <img src={a.url} alt="Artwork" loading="lazy" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Platforms & Languages ─────────────────────────────────────────── */}
        <div className="game-detail-platforms-grid">
          {detail.releaseDates.length > 0 && (
            <Section title="Releases">
              <div>
                {(() => {
                  const groupedReleases = detail.releaseDates.reduce(
                    (acc, rd) => {
                      const key = rd.platform + (rd.region ? ` (${rd.region})` : "");
                      if (!acc.some((x) => x.key === key)) acc.push({ key, date: rd.date });
                      return acc;
                    },
                    [] as { key: string; date: string }[]
                  );
                  return groupedReleases
                    .slice(0, 15)
                    .map((rd, i) => <DetailRow key={i} label={rd.key} value={rd.date} />);
                })()}
              </div>
            </Section>
          )}
          {detail.languages && detail.languages.length > 0 && (
            <Section title="Language Support">
              <div>
                {detail.languages.slice(0, 20).map((ls, i) => (
                  <DetailRow key={i} label={ls.language} value={ls.types.join(", ")} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Links ─────────────────────────────────────────────────── */}
        {detail.websites.length > 0 && (
          <Section title="Links">
            <div className="game-detail-links">
              {detail.websites
                .filter(
                  (w) =>
                    ![
                      "Facebook",
                      "Twitter",
                      "Instagram",
                      "Twitch",
                      "Reddit",
                      "Discord",
                      "External Link",
                    ].includes(w.categoryName)
                )
                .map((w) => (
                  <a
                    key={w.url}
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    className="game-detail-link-pill"
                  >
                    <ExternalLink size={13} color="var(--apple-tertiary-label)" />
                    {w.categoryName}
                  </a>
                ))}
            </div>
          </Section>
        )}

        {/* ── Related games ─────────────────────────────────────────────────── */}
        {activeTabs.length > 0 && currentRelTab && (
          <Section title="Related">
            <div className="related-tabs">
              {activeTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveRelTab(tab)}
                  className={`related-tab-btn ${currentRelTab === tab ? "active" : ""}`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
            <div className="related-header">
              <span className="related-count">
                {detail.related[currentRelTab]?.length ?? 0}{" "}
                {detail.related[currentRelTab]?.length === 1 ? "game" : "games"}
              </span>
              <button
                type="button"
                className="related-view-all"
                onClick={() => navigate(`/game/${igdbId}/related?tab=${currentRelTab}`)}
              >
                View all <ChevronRight size={13} />
              </button>
            </div>
            <RelatedStrip
              games={detail.related[currentRelTab] ?? []}
              onGameClick={(id) => onOpenGame(id)}
            />
          </Section>
        )}

        {/* ── Games like this from your library (Semantic) ────────────────── */}
        {similarLibraryGames.length > 0 && (
          <Section title="Games like this from your library">
            <RelatedStrip games={similarLibraryGames} onGameClick={(id) => onOpenGame(id)} />
          </Section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Larger view" className="lightbox-img" />
        </div>
      )}
    </ScreenShell>
  );
}

// ─── Screen shell with toolbar ────────────────────────────────────────────────

function ScreenShell({
  children,
  onBack,
  title,
}: {
  children: React.ReactNode;
  onBack: () => void;
  title: string;
}) {
  return (
    <main id="main-content" className="game-detail-screen">
      <div className="game-detail-toolbar glass-panel">
        <button type="button" className="game-detail-back-btn" onClick={onBack} aria-label="Back">
          <ChevronLeft size={16} /> Back
        </button>
        {title && <span className="game-detail-toolbar-title">{title}</span>}
      </div>
      {children}
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="game-detail-section">
      <h2 className="game-detail-section-title">{title}</h2>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? "var(--apple-tertiary-label)";
  return (
    <span
      className="status-badge"
      style={{
        background:
          STATUS_SUBTLE[status as keyof typeof STATUS_SUBTLE] ?? "var(--apple-tertiary-bg)",
        color,
      }}
    >
      <span className="status-badge-dot" style={{ background: color }} />
      {status}
    </span>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <span className="meta-item-label">{label}</span>
      <span className="meta-item-value">{value}</span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  onValueClick,
}: {
  label: string;
  value: string;
  onValueClick?: () => void;
}) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">{label}</span>
      {onValueClick ? (
        <button type="button" className="detail-row-link" onClick={onValueClick}>
          {value}
        </button>
      ) : (
        <span className="detail-row-value">{value}</span>
      )}
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="expandable-text">
      <p className={expanded ? "" : "clamped"}>{text}</p>
      {text.length > 300 && (
        <button
          type="button"
          className="expandable-text-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
