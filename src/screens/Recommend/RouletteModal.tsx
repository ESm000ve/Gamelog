import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RefreshCw, Sparkles, Dices, Brain } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { coverUrl } from "../../types/gameDetail";
import { cosineSimilarity } from "../../services/ai";

interface RouletteModalProps {
  onClose: () => void;
  onStartPlaying: (igdbId: number) => void;
}

// Fisher-Yates shuffle — ensures truly random ordering
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RouletteModal({ onClose, onStartPlaying }: RouletteModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledBacklog, setShuffledBacklog] = useState<{ game: any; log: any }[]>([]);
  const [aiReason, setAiReason] = useState<string | null>(null);
  const [loadingReason, setLoadingReason] = useState(false);

  const rawBacklog =
    useLiveQuery(async () => {
      const logs = await db.logs.toArray();
      const backlogLogs = logs.filter((l) => l.status === "Backlog");
      if (backlogLogs.length === 0) return [];
      const gameIds = backlogLogs.map((l) => l.igdbId);
      const games = await db.games.where("igdbId").anyOf(gameIds).toArray();
      const gameMap = new Map(games.map((g) => [g.igdbId, g]));
      return backlogLogs
        .map((l) => ({ game: gameMap.get(l.igdbId)!, log: l }))
        .filter((x) => x.game);
    }) ?? [];

  // Shuffle once when the raw data arrives so every modal open has a different order
  useEffect(() => {
    if (rawBacklog.length > 0) {
      setShuffledBacklog(shuffleArray(rawBacklog));
    }
  }, [rawBacklog.length]);

  const timerRef = useRef<number | null>(null);

  const generateAiReason = useCallback(async (winner: { game: any; log: any }) => {
    setLoadingReason(true);
    setAiReason(null);
    try {
      // Build a lightweight taste profile for context
      const allGames = await db.games.toArray();
      const allLogs = await db.logs.toArray();
      const logMap = new Map(allLogs.map((l) => [l.igdbId, l]));

      const topRated = allGames
        .filter((g) => (logMap.get(g.igdbId)?.rating ?? 0) >= 4)
        .sort((a, b) => (logMap.get(b.igdbId)?.rating ?? 0) - (logMap.get(a.igdbId)?.rating ?? 0))
        .slice(0, 5);

      // Try cosine similarity to find most similar top-rated game
      let matchName = "";
      if (winner.game.embedding && topRated.length > 0) {
        let best = 0;
        for (const t of topRated) {
          if (t.embedding) {
            const sim = cosineSimilarity(winner.game.embedding, t.embedding);
            if (sim > best) {
              best = sim;
              matchName = t.title;
            }
          }
        }
      }

      // Build a rich reason locally — no API call needed for roulette
      const g = winner.game;
      const ttb = g.timeToBeat?.finish;
      const genres = g.genres?.slice(0, 2).join(" / ") ?? "";
      const rating = g.igdbRating ? `${Math.round(g.igdbRating)} on IGDB` : "";

      const parts: string[] = [];
      if (matchName) parts.push(`Similar energy to ${matchName}, which you loved`);
      if (genres) parts.push(`${genres} game`);
      if (ttb) parts.push(`~${Math.round(ttb)}h to beat`);
      if (rating) parts.push(`scored ${rating}`);

      if (parts.length > 0) {
        setAiReason(parts.join(" · "));
      } else if (g.summary) {
        setAiReason(g.summary.slice(0, 120) + (g.summary.length > 120 ? "…" : ""));
      } else {
        setAiReason("A game sitting in your backlog waiting for its moment.");
      }
    } catch {
      setAiReason(null);
    } finally {
      setLoadingReason(false);
    }
  }, []);

  const startSpin = useCallback(() => {
    const backlog = shuffledBacklog;
    if (backlog.length === 0) return;

    // Clear previous result
    setFinished(false);
    setAiReason(null);
    setSpinning(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Re-shuffle on each spin so result is unpredictable
    const freshShuffled = shuffleArray(backlog);
    setShuffledBacklog(freshShuffled);

    // Pick winner from the freshly shuffled pool
    const winnerIndex = Math.floor(Math.random() * freshShuffled.length);
    const winner = freshShuffled[winnerIndex];

    let speed = 50;
    let iterations = 0;
    const maxIterations = 45 + Math.floor(Math.random() * 25); // 45–70 spins

    const tick = () => {
      iterations++;
      setCurrentIndex((prev) => (prev + 1) % freshShuffled.length);

      if (iterations < maxIterations) {
        // Ease-out: only slow down in the last 40%
        if (iterations > maxIterations * 0.6) {
          speed += 18;
        }
        timerRef.current = window.setTimeout(tick, speed);
      } else {
        setCurrentIndex(winnerIndex);
        setSpinning(false);
        setFinished(true);
        generateAiReason(winner);
      }
    };

    tick();
  }, [shuffledBacklog, generateAiReason]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (shuffledBacklog.length === 0 && rawBacklog.length === 0) {
    return (
      <Modal isOpen={true} onClose={onClose}>
        <div style={{ textAlign: "center", padding: "var(--space-10)" }}>
          <p style={{ color: "var(--apple-label)", fontSize: 15, fontWeight: 500 }}>
            Your backlog is empty!
          </p>
          <Button variant="secondary" onClick={onClose} style={{ marginTop: "var(--space-4)" }}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  const backlog = shuffledBacklog.length > 0 ? shuffledBacklog : rawBacklog;
  const activeEntry = backlog[currentIndex];
  const activeGame = activeEntry?.game;

  const imgSrc = activeGame?.coverUrl
    ? coverUrl(activeGame.coverUrl.split("/").pop()?.split(".")[0] ?? "", "cover_big")
    : undefined;

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 360,
          padding: "var(--space-8) var(--space-8) var(--space-10)",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--apple-font-display)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--apple-label)",
            marginBottom: "var(--space-6)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Dices size={20} color="var(--apple-accent)" />
          Backlog Roulette
        </h2>

        {/* Cover window */}
        <div
          style={{
            width: 220,
            aspectRatio: "3/4",
            borderRadius: "var(--radius-xl)",
            background: activeGame?.coverColor ?? "var(--apple-tertiary-bg)",
            boxShadow: finished
              ? "0 0 0 3px var(--apple-accent), 0 16px 48px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.3)",
            overflow: "hidden",
            position: "relative",
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
            transform: finished ? "scale(1.04)" : "scale(1)",
            marginBottom: "var(--space-5)",
            flexShrink: 0,
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={activeGame?.title ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "var(--space-4)",
              }}
            >
              <span
                style={{
                  color: "var(--apple-label)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {activeGame?.title}
              </span>
            </div>
          )}

          {/* Scanline while spinning */}
          {spinning && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                backgroundSize: "100% 200%",
                animation: "scan 0.6s linear infinite",
              }}
            />
          )}

          {/* Finished glow overlay */}
          {finished && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6) 100%)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Game title */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--apple-label)",
            textAlign: "center",
            minHeight: 28,
            marginBottom: "var(--space-2)",
            opacity: finished ? 1 : spinning ? 0.4 : 0,
            transition: "opacity 0.3s ease",
            fontFamily: "var(--apple-font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          {activeGame?.title}
        </h3>

        {/* Developer / year sub-line */}
        {finished && activeGame && (
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--apple-secondary-label)",
              margin: "0 0 var(--space-3) 0",
              textAlign: "center",
            }}
          >
            {[activeGame.developer, activeGame.releaseYear].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* AI reason */}
        {finished && (
          <div
            style={{
              width: "100%",
              minHeight: 54,
              marginBottom: "var(--space-6)",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              background: "var(--apple-accent)0d",
              border: "1px solid var(--apple-accent)22",
              boxSizing: "border-box",
            }}
          >
            {loadingReason ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  justifyContent: "center",
                  padding: "var(--space-2) 0",
                }}
              >
                <Brain
                  size={14}
                  color="var(--apple-accent)"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span
                  style={{ fontSize: "var(--font-size-sm)", color: "var(--apple-secondary-label)" }}
                >
                  Analyzing your taste profile…
                </span>
              </div>
            ) : aiReason ? (
              <>
                <Sparkles
                  size={14}
                  color="var(--apple-accent)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--font-size-sm)",
                    lineHeight: 1.5,
                    color: "var(--apple-secondary-label)",
                    fontStyle: "italic",
                  }}
                >
                  {aiReason}
                </p>
              </>
            ) : null}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {finished ? (
            <>
              <Button
                variant="primary"
                onClick={() => onStartPlaying(activeGame!.igdbId)}
                style={{
                  borderRadius: "var(--radius-full)",
                  padding: "var(--space-3) var(--space-6)",
                  fontSize: 15,
                  boxShadow: "0 4px 12px rgba(10,132,255,0.3)",
                }}
              >
                <Play size={16} /> Play Now
              </Button>
              <button
                onClick={startSpin}
                aria-label="Spin again"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--apple-fill)",
                  color: "var(--apple-label)",
                  border: "1px solid var(--apple-separator)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <RefreshCw size={18} />
              </button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={startSpin}
              disabled={spinning || shuffledBacklog.length === 0}
              style={{
                borderRadius: "var(--radius-full)",
                padding: "var(--space-3) var(--space-8)",
                fontSize: 15,
                background: spinning ? "var(--apple-fill)" : undefined,
                color: spinning ? "var(--apple-tertiary-label)" : undefined,
                gap: 8,
              }}
            >
              <Dices size={16} className={spinning ? "animate-spin" : ""} />
              {spinning ? "Spinning…" : "SPIN"}
            </Button>
          )}
        </div>

        {/* Backlog count hint */}
        {!spinning && !finished && (
          <p
            style={{
              marginTop: "var(--space-4)",
              fontSize: 12,
              color: "var(--apple-tertiary-label)",
            }}
          >
            {backlog.length} game{backlog.length !== 1 ? "s" : ""} in your backlog
          </p>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%   { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
}
