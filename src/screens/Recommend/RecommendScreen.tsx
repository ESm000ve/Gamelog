import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Play,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Zap,
  Brain,
  Clock,
  Star,
  Dices,
  Eye,
} from "lucide-react";
import {
  getRecommendations,
  getTasteProfile,
  type RecommenderCandidate,
} from "../../services/recommender";
import { coverUrl } from "../../types/gameDetail";
import { db } from "../../db/schema";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { RouletteModal } from "./RouletteModal";
import { Button } from "../../components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TasteProfile {
  topGenres: { genre: string; count: number }[];
  topRatedCount: number;
  backlogCount: number;
  avgRating: number;
  topRatedGames: { title: string; rating: number; coverUrl?: string }[];
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function RecommendScreen() {
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<RecommenderCandidate[]>([]);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [howOpen, setHowOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rouletteOpen = searchParams.get("roulette") === "true";

  const fetchPicks = useCallback(async (currentIntent: string, currentExcluded: number[]) => {
    setLoading(true);
    try {
      const results = await getRecommendations(currentIntent, currentExcluded);
      setPicks(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPicks("", []);
  }, [fetchPicks]);

  useEffect(() => {
    getTasteProfile().then(setTasteProfile);
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).openRoulette) {
      setSearchParams((prev) => {
        prev.set("roulette", "true");
        return prev;
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, setSearchParams]);

  useEffect(() => {
    const handleOpenRoulette = () => {
      setSearchParams((prev) => {
        prev.set("roulette", "true");
        return prev;
      });
    };
    window.addEventListener("gamelog:open-roulette", handleOpenRoulette);
    return () => window.removeEventListener("gamelog:open-roulette", handleOpenRoulette);
  }, [setSearchParams]);

  const handleReroll = () => {
    const newExcluded = [...excludedIds, ...picks.map((p) => p.game.igdbId)];
    setExcludedIds(newExcluded);
    fetchPicks(intent, newExcluded);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setExcludedIds([]);
    fetchPicks(intent, []);
  };

  const handleStartPlaying = async (e: React.MouseEvent, igdbId: number) => {
    e.stopPropagation();
    const log = await db.logs.get(igdbId);
    if (log) {
      log.status = "Playing";
      log.updatedAt = Date.now();
      await db.logs.put(log);
      navigate(`/game/${igdbId}`);
    }
  };

  const handleSkip = (e: React.MouseEvent, igdbId: number) => {
    e.stopPropagation();
    setExcludedIds((prev) => [...prev, igdbId]);
    setPicks((prev) => prev.filter((p) => p.game.igdbId !== igdbId));
  };

  return (
    <main
      id="main-content"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 308px 0 var(--space-8)",
          height: 56,
          boxSizing: "border-box",
          background: "var(--apple-toolbar-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid var(--apple-separator)",
          WebkitAppRegion: "drag" as any,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            WebkitAppRegion: "no-drag" as any,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--apple-font-display)",
              fontSize: "var(--font-size-lg)",
              fontWeight: 600,
              color: "var(--apple-label)",
              letterSpacing: "-0.015em",
              lineHeight: 1,
            }}
          >
            What to Play
          </h1>
          {tasteProfile && (
            <span
              style={{ color: "var(--apple-secondary-label)", fontSize: "var(--font-size-base)" }}
            >
              {tasteProfile.backlogCount} in backlog
            </span>
          )}
        </div>
      </div>

      {/* ── Filter strip ── */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-8)",
          gap: 12,
          borderBottom: "1px solid var(--apple-separator)",
          WebkitAppRegion: "no-drag" as any,
        }}
      >
        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, maxWidth: 560 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Sparkles
              size={14}
              aria-hidden
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--apple-accent)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder='Describe what you&apos;re in the mood for, e.g. "a short relaxing RPG"'
              aria-label="What kind of game are you looking for?"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 32,
                paddingRight: "var(--space-3)",
                boxSizing: "border-box",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--apple-separator)",
                background: "var(--apple-fill)",
                color: "var(--apple-label)",
                fontSize: "var(--font-size-base)",
                outline: "none",
                height: 32,
              }}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            style={{ height: 32, flexShrink: 0, boxSizing: "border-box" }}
          >
            Get picks
          </Button>
        </form>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReroll}
            style={{
              color: "var(--apple-accent)",
              fontWeight: 500,
              height: 32,
              boxSizing: "border-box",
            }}
          >
            <RefreshCw size={13} /> Show me others
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              setSearchParams((prev) => {
                prev.set("roulette", "true");
                return prev;
              })
            }
            style={{
              borderRadius: "var(--radius-full)",
              height: 32,
              boxSizing: "border-box",
            }}
          >
            <Dices size={13} /> Backlog Roulette
          </Button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "var(--space-6) var(--space-8) var(--space-10)" }}>
          {/* ── Taste Profile strip ── */}
          {tasteProfile && tasteProfile.topRatedCount > 0 && (
            <TasteProfileStrip profile={tasteProfile} />
          )}

          {/* ── How it works ── */}
          <HowItWorks open={howOpen} onToggle={() => setHowOpen((o) => !o)} />

          {/* ── Picks ── */}
          <div style={{ marginTop: "var(--space-6)" }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  paddingTop: 60,
                  paddingBottom: 60,
                }}
              >
                <Loader2 size={28} className="animate-spin" color="var(--apple-accent)" />
                <p
                  style={{
                    color: "var(--apple-tertiary-label)",
                    fontSize: "var(--font-size-base)",
                  }}
                >
                  Analyzing your taste profile…
                </p>
              </div>
            ) : picks.length === 0 ? (
              <EmptyState
                onRoulette={() =>
                  setSearchParams((prev) => {
                    prev.set("roulette", "true");
                    return prev;
                  })
                }
              />
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "var(--apple-font-display)",
                        fontSize: "var(--font-size-lg)",
                        fontWeight: 600,
                        color: "var(--apple-label)",
                      }}
                    >
                      Top Picks for You
                    </h2>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "var(--font-size-base)",
                        color: "var(--apple-secondary-label)",
                      }}
                    >
                      {intent.trim() ? `Based on: "${intent}"` : "Based on your taste profile"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {picks.map((pick, idx) => (
                    <PickCard
                      key={pick.game.igdbId}
                      pick={pick}
                      rank={idx + 1}
                      onOpen={() => navigate(`/game/${pick.game.igdbId}`)}
                      onStartPlaying={(e) => handleStartPlaying(e, pick.game.igdbId)}
                      onSkip={(e) => handleSkip(e, pick.game.igdbId)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Roulette card ── */}
          {!loading && (
            <RouletteCard
              onOpen={() =>
                setSearchParams((prev) => {
                  prev.set("roulette", "true");
                  return prev;
                })
              }
            />
          )}
        </div>
      </div>

      {rouletteOpen && (
        <RouletteModal
          onClose={() =>
            setSearchParams((prev) => {
              prev.delete("roulette");
              return prev;
            })
          }
          onStartPlaying={async (id) => {
            setSearchParams((prev) => {
              prev.delete("roulette");
              return prev;
            });
            const log = await db.logs.get(id);
            if (log) {
              log.status = "Playing";
              log.updatedAt = Date.now();
              await db.logs.put(log);
              navigate(`/game/${id}`);
            }
          }}
        />
      )}
    </main>
  );
}

// ─── Pick Card ────────────────────────────────────────────────────────────────

function PickCard({
  pick,
  rank,
  onOpen,
  onStartPlaying,
  onSkip,
}: {
  pick: RecommenderCandidate;
  rank: number;
  onOpen: () => void;
  onStartPlaying: (e: React.MouseEvent) => void;
  onSkip: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const imgUrl = pick.game.coverUrl
    ? coverUrl(pick.game.coverUrl.split("/").pop()?.split(".")[0] ?? "", "cover_big")
    : undefined;

  const ttb = pick.game.timeToBeat?.finish;
  const ttbLabel = ttb ? `~${Math.round(ttb)}h` : null;

  const rawSim = pick.similarity ?? 0;
  const matchPct = rawSim > 0 ? Math.round(Math.min(rawSim * 100 + 40, 99)) : 0;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 0,
        borderRadius: "var(--radius-2xl)",
        background: "var(--apple-secondary-bg)",
        border: `1px solid ${hovered ? "var(--apple-accent)40" : "var(--apple-separator)"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.12)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Rank number */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          flexShrink: 0,
          background: rank === 1 ? "var(--apple-accent)" : "var(--apple-fill)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--apple-font-display)",
            fontSize: rank === 1 ? 18 : 14,
            fontWeight: 700,
            color: rank === 1 ? "white" : "var(--apple-tertiary-label)",
          }}
        >
          {rank}
        </span>
      </div>

      {/* Cover */}
      <div
        style={{
          width: 100,
          flexShrink: 0,
          background: pick.game.coverColor || "var(--apple-tertiary-bg)",
          position: "relative",
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={pick.game.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-2)",
            }}
          >
            <span
              style={{
                color: "var(--apple-label)",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {pick.game.title}
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "var(--space-4) var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 0,
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--apple-font-display)",
                fontSize: "var(--font-size-lg)",
                fontWeight: 600,
                color: "var(--apple-label)",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pick.game.title}
            </h3>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "var(--font-size-sm)",
                color: "var(--apple-secondary-label)",
              }}
            >
              {[pick.game.developer, pick.game.releaseYear].filter(Boolean).join(" · ")}
            </p>
          </div>

          {/* Match badge */}
          {matchPct > 0 && (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--apple-accent)18",
                border: "1px solid var(--apple-accent)30",
              }}
            >
              <Sparkles size={12} color="var(--apple-accent)" aria-hidden />
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--apple-accent)",
                }}
              >
                {matchPct}% match
              </span>
            </div>
          )}
        </div>

        {/* Meta chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {pick.game.genres?.slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--apple-fill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                color: "var(--apple-secondary-label)",
                border: "1px solid var(--apple-separator)",
              }}
            >
              {g}
            </span>
          ))}
          {ttbLabel && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--apple-fill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                color: "var(--apple-secondary-label)",
                border: "1px solid var(--apple-separator)",
              }}
            >
              <Clock size={12} aria-hidden /> {ttbLabel}
            </span>
          )}
          {pick.game.igdbRating && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--apple-fill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: 500,
                color: "var(--apple-secondary-label)",
                border: "1px solid var(--apple-separator)",
              }}
            >
              <Star size={12} aria-hidden /> {Math.round(pick.game.igdbRating)}
            </span>
          )}
        </div>

        {/* AI reason */}
        {pick.reason && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              background: "var(--apple-accent)0d",
              border: "1px solid var(--apple-accent)20",
            }}
          >
            <Sparkles
              size={14}
              color="var(--apple-accent)"
              aria-hidden
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-base)",
                lineHeight: 1.5,
                color: "var(--apple-secondary-label)",
                fontStyle: "italic",
              }}
            >
              {pick.reason}
            </p>
          </div>
        )}

        {/* Action row */}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
          <Button
            variant="primary"
            size="sm"
            onClick={onStartPlaying}
            style={{ borderRadius: "var(--radius-full)", gap: 6 }}
          >
            <Play size={12} fill="currentColor" /> Start playing
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpen}
            style={{ color: "var(--apple-accent)", borderRadius: "var(--radius-full)", gap: 6 }}
          >
            <Eye size={12} /> View game
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            style={{
              marginLeft: "auto",
              color: "var(--apple-tertiary-label)",
              borderRadius: "var(--radius-full)",
              fontSize: 11,
            }}
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Taste Profile Strip ──────────────────────────────────────────────────────

function TasteProfileStrip({ profile }: { profile: TasteProfile }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "var(--space-4) var(--space-6)",
        borderRadius: "var(--radius-2xl)",
        background: "var(--apple-secondary-bg)",
        border: "1px solid var(--apple-separator)",
        marginBottom: "var(--space-4)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--apple-accent)20",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={18} color="var(--apple-accent)" aria-hidden />
        </div>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              color: "var(--apple-label)",
            }}
          >
            Taste Profile
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "var(--font-size-sm)",
              color: "var(--apple-secondary-label)",
            }}
          >
            {profile.topRatedCount} highly-rated games
          </p>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: "var(--apple-separator)", flexShrink: 0 }} />

      {/* Top genres */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {profile.topGenres.slice(0, 4).map(({ genre }) => (
          <span
            key={genre}
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--apple-accent)18",
              border: "1px solid var(--apple-accent)30",
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--apple-accent)",
            }}
          >
            {genre}
          </span>
        ))}
      </div>

      <div style={{ width: 1, height: 36, background: "var(--apple-separator)", flexShrink: 0 }} />

      {/* Top rated games mini-covers */}
      <div style={{ display: "flex", gap: -4, alignItems: "center", marginLeft: "auto" }}>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--apple-secondary-label)",
            marginRight: 8,
            fontWeight: 500,
          }}
        >
          Fingerprinted from
        </span>
        {profile.topRatedGames.slice(0, 5).map((g, i) => (
          <div
            key={g.title}
            title={g.title}
            style={{
              width: 26,
              height: 34,
              borderRadius: 6,
              overflow: "hidden",
              background: "var(--apple-fill)",
              border: "1px solid var(--apple-separator)",
              marginLeft: i > 0 ? -8 : 0,
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {g.coverUrl ? (
              <img
                src={coverUrl(g.coverUrl.split("/").pop()?.split(".")[0] ?? "", "cover_small")}
                alt={g.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--apple-fill)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const steps = [
    {
      Icon: Brain,
      color: "var(--apple-purple)",
      title: "Taste Fingerprint",
      desc: "Your top-rated games are converted into semantic embedding vectors — a mathematical representation of their themes, tone, and gameplay DNA.",
    },
    {
      Icon: Zap,
      color: "var(--apple-orange)",
      title: "Cosine Similarity Ranking",
      desc: "Every game in your Backlog and Wishlist is scored by how closely its embedding aligns with your fingerprint — the higher the similarity, the higher it ranks.",
    },
    {
      Icon: Sparkles,
      color: "var(--apple-accent)",
      title: "Intent Refinement",
      desc: "When you describe a mood or genre in the search box, the top 20 candidates are sent to an AI model which re-ranks them and writes a personalised reason for each pick.",
    },
  ];

  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--apple-separator)",
        background: "var(--apple-secondary-bg)",
        overflow: "hidden",
        marginBottom: open ? "var(--space-4)" : 0,
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "var(--space-3) var(--space-5)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--apple-secondary-label)",
          fontSize: "var(--font-size-base)",
          fontWeight: 600,
          textAlign: "left",
        }}
      >
        <Sparkles size={16} color="var(--apple-accent)" aria-hidden />
        How does this work?
        {open ? (
          <ChevronDown size={16} style={{ marginLeft: "auto" }} />
        ) : (
          <ChevronRight size={16} style={{ marginLeft: "auto" }} />
        )}
      </button>

      {open && (
        <div
          style={{
            borderTop: "1px solid var(--apple-separator)",
            padding: "var(--space-5)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-4)",
          }}
        >
          {steps.map(({ Icon, color, title, desc }) => (
            <div key={title} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: `${color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={color} aria-hidden />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  color: "var(--apple-label)",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-size-sm)",
                  lineHeight: 1.5,
                  color: "var(--apple-secondary-label)",
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Roulette card ────────────────────────────────────────────────────────────

function RouletteCard({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginTop: "var(--space-8)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        padding: "var(--space-5) var(--space-6)",
        borderRadius: "var(--radius-2xl)",
        background: hovered
          ? "linear-gradient(135deg, var(--apple-accent), var(--apple-purple))"
          : "linear-gradient(135deg, var(--apple-accent)cc, var(--apple-purple)cc)",
        cursor: "pointer",
        transition: "background 200ms ease, box-shadow 200ms ease, transform 160ms ease",
        boxShadow: hovered ? "0 12px 32px rgba(10,132,255,0.3)" : "0 4px 16px rgba(10,132,255,0.2)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-xl)",
          background: "rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Dices size={24} color="white" aria-hidden />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--apple-font-display)",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
          }}
        >
          Backlog Roulette
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "var(--font-size-sm)",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Can't decide? Spin the wheel and let fate choose from your backlog.
        </p>
      </div>
      <ChevronRight size={20} color="rgba(255,255,255,0.7)" aria-hidden />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onRoulette }: { onRoulette: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        paddingTop: 60,
        paddingBottom: 40,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-xl)",
          background: "var(--apple-fill)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BookOpen size={22} color="var(--apple-tertiary-label)" aria-hidden />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "var(--font-size-base)",
          fontWeight: 600,
          color: "var(--apple-label)",
        }}
      >
        No matches found
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "var(--font-size-sm)",
          color: "var(--apple-tertiary-label)",
          maxWidth: 340,
        }}
      >
        Try adjusting your search, or add more games to your backlog to get better picks.
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={onRoulette}
        style={{ borderRadius: "var(--radius-full)", marginTop: 8 }}
      >
        <Dices size={14} /> Try Backlog Roulette
      </Button>
    </div>
  );
}
