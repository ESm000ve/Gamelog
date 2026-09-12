import { db } from "../db/schema";
import { cosineSimilarity } from "./ai";
import type { Game, Log } from "../types";

export interface RecommenderCandidate {
  game: Game;
  log: Log;
  score: number;
  /** Raw similarity (0–1) to the user's taste fingerprint */
  similarity?: number;
  /** The top-rated game this pick was most similar to */
  matchedGame?: Game;
  /** Reason text — either LLM-generated or local fallback */
  reason?: string;
  /** Which signals drove this recommendation */
  signals?: RecommendSignal[];
}

export type RecommendSignal =
  | { type: "genre"; label: string }
  | { type: "similar"; label: string }
  | { type: "rating"; label: string }
  | { type: "length"; label: string }
  | { type: "intent"; label: string };

/**
 * Pre-ranks the backlog based on user's top rated games and embeddings.
 */
export async function preRankCandidates(
  excludeIds: number[] = []
): Promise<RecommenderCandidate[]> {
  const allGames = await db.games.toArray();
  const allLogs = await db.logs.toArray();

  const logMap = new Map<number, Log>();
  allLogs.forEach((l) => logMap.set(l.igdbId, l));

  // 1. Identify user's top-rated games (proxy for their taste)
  const topRated = allGames.filter((g) => {
    const l = logMap.get(g.igdbId);
    return l && (l.rating ?? 0) >= 4.0;
  });

  // 2. Identify candidates (Backlog or Wishlist, NOT Played/Playing)
  const candidates = allGames.filter((g) => {
    if (excludeIds.includes(g.igdbId)) return false;
    const l = logMap.get(g.igdbId);
    if (!l) return false;
    return l.status === "Backlog" || l.status === "Wishlist";
  });

  if (candidates.length === 0) return [];

  // 3. Score candidates
  const scored = candidates.map((g) => {
    let maxSim = 0;
    let matchedGame: Game | undefined;

    if (g.embedding && topRated.length > 0) {
      for (const top of topRated) {
        if (top.embedding) {
          const sim = cosineSimilarity(g.embedding, top.embedding);
          if (sim > maxSim) {
            maxSim = sim;
            matchedGame = top;
          }
        }
      }
    }

    // Base score:
    // - Semantic similarity to top rated games (0 to 1) * 100
    let score = maxSim * 100;

    // Slight bump for IGDB rating as a baseline quality measure
    if (g.igdbRating) {
      score += (g.igdbRating / 100) * 10;
    }

    const log = logMap.get(g.igdbId)!;
    const signals: RecommendSignal[] = [];

    if (matchedGame) {
      signals.push({ type: "similar", label: `Similar to ${matchedGame.title}` });
    }
    if (g.igdbRating && g.igdbRating >= 80) {
      signals.push({ type: "rating", label: `${Math.round(g.igdbRating)}% on IGDB` });
    }
    if (g.genres?.length) {
      signals.push({ type: "genre", label: g.genres[0] });
    }

    return { game: g, log, score, similarity: maxSim, matchedGame, signals };
  });

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Composes a rich, multi-signal reason string without calling the LLM.
 * Used as the local fallback when the API is unavailable.
 */
function buildRichFallbackReason(c: RecommenderCandidate): string {
  const parts: string[] = [];
  const g = c.game;

  if (c.matchedGame) {
    parts.push(`Similar feel to ${c.matchedGame.title}, which you loved`);
  }

  const genres = g.genres?.slice(0, 2).join(" / ");
  if (genres) parts.push(`a ${genres} game`);

  const ttb = g.timeToBeat?.finish;
  if (ttb) parts.push(`~${Math.round(ttb)}h to beat`);

  if (g.igdbRating && g.igdbRating >= 75) {
    parts.push(`scored ${Math.round(g.igdbRating)} on IGDB`);
  }

  if (parts.length === 0) {
    return g.summary
      ? g.summary.slice(0, 130) + (g.summary.length > 130 ? "…" : "")
      : "A great game waiting in your backlog.";
  }

  return parts.join(" · ") + ".";
}

/**
 * Builds a concise intent string from the user's top-rated taste profile
 * so the LLM can write specific reasons even when the user typed nothing.
 */
function buildTasteIntent(ranked: RecommenderCandidate[]): string {
  const topMatched = ranked
    .filter((c) => c.matchedGame)
    .slice(0, 3)
    .map((c) => c.matchedGame!.title);

  // Collect genres from the matched games
  const genreCounts: Record<string, number> = {};
  ranked.slice(0, 10).forEach((c) => {
    c.game.genres?.forEach((g) => {
      genreCounts[g] = (genreCounts[g] ?? 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const parts: string[] = [];
  if (topMatched.length > 0) parts.push(`games with similar feel to ${topMatched.join(", ")}`);
  if (topGenres.length > 0) parts.push(`preference for ${topGenres.join(" / ")}`);
  return parts.length > 0
    ? `Based on the user's taste profile: ${parts.join(" and ")}.`
    : "Great unplayed games from the user's backlog, ranked by taste similarity.";
}

export async function getRecommendations(
  intent: string,
  excludeIds: number[] = []
): Promise<RecommenderCandidate[]> {
  const ranked = await preRankCandidates(excludeIds);
  if (ranked.length === 0) return [];

  // Build an intent string from the user's taste profile when none is typed
  // so the LLM always writes specific, personal reasons.
  const effectiveIntent = intent.trim() || buildTasteIntent(ranked);

  // Take top 20 pre-ranked candidates for the LLM to choose from
  const topCandidates = ranked.slice(0, 20);

  const payload = topCandidates.map((c) => ({
    id: c.game.igdbId,
    title: c.game.title,
    genres: c.game.genres,
    timeToBeat: c.game.timeToBeat?.finish,
    igdbRating: c.game.igdbRating,
  }));

  try {
    const res = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: effectiveIntent, candidates: payload }),
    });

    if (!res.ok) {
      throw new Error("LLM call failed");
    }

    const data = await res.json();

    // data.picks should be array of { id, reason }
    const picks: { id: number; reason: string }[] = data.picks || [];

    const finalPicks: RecommenderCandidate[] = [];
    for (const pick of picks) {
      const match = topCandidates.find((c) => c.game.igdbId === pick.id);
      if (match) {
        finalPicks.push({ ...match, reason: pick.reason });
      }
    }

    if (finalPicks.length > 0) return finalPicks;
  } catch (err) {
    console.warn("Recommender LLM fallback triggered:", err);
  }

  // --- Local Fallback Logic ---
  const q = intent.toLowerCase();

  // 1. Identify local filters based on intent string
  const wantsShort = q.includes("short") || q.includes("quick") || q.includes("bite-sized");
  const wantsLong = q.includes("long") || q.includes("epic") || q.includes("hundred hours");

  const commonGenres = [
    "rpg",
    "action",
    "adventure",
    "strategy",
    "simulation",
    "sports",
    "puzzle",
    "indie",
    "shooter",
    "platform",
    "fighting",
    "racing",
    "arcade",
    "music",
    "tactical",
  ];
  const matchedGenres = commonGenres.filter((g) => q.includes(g));

  // 2. Score and filter candidates locally
  const localScored = ranked.map((c) => {
    let score = c.score;
    let reason = buildRichFallbackReason(c);
    let matchesIntent = false;
    const signals: RecommendSignal[] = [...(c.signals ?? [])];

    // Check Length
    const ttb = c.game.timeToBeat?.finish;
    if (wantsShort) {
      if (ttb && ttb <= 12) {
        score += 50;
        matchesIntent = true;
        reason = `A shorter experience that fits your request (~${Math.round(ttb)}h to beat).`;
        signals.push({ type: "length", label: `~${Math.round(ttb)}h to beat` });
      } else if (ttb && ttb > 20) {
        score -= 100;
      }
    } else if (wantsLong) {
      if (ttb && ttb >= 30) {
        score += 50;
        matchesIntent = true;
        reason = `An epic adventure you can sink serious time into (~${Math.round(ttb)}h).`;
        signals.push({ type: "length", label: `~${Math.round(ttb)}h to beat` });
      } else if (ttb && ttb < 15) {
        score -= 100;
      }
    }

    // Check Genres
    if (matchedGenres.length > 0 && c.game.genres) {
      const gameGenresLower = c.game.genres.map((g) => g.toLowerCase());
      const hasGenre = matchedGenres.some((mg) => gameGenresLower.some((gg) => gg.includes(mg)));
      if (hasGenre) {
        score += 80;
        matchesIntent = true;
        const formattedGenres = matchedGenres.map((g) => g.charAt(0).toUpperCase() + g.slice(1));
        reason = `Matches your request for ${formattedGenres.join(" / ")} — and already fits your taste profile.`;
        signals.push({ type: "intent", label: formattedGenres.join(", ") });
      }
    }

    // Check title match (fallback keyword)
    if (c.game.title.toLowerCase().includes(q)) {
      score += 100;
      matchesIntent = true;
      reason = "Matches your keyword search and is already in your backlog.";
    }

    if (!matchesIntent) {
      reason = buildRichFallbackReason(c);
    }

    return { ...c, score, reason, signals };
  });

  localScored.sort((a, b) => b.score - a.score);
  return localScored.slice(0, 5);
}

/**
 * Derives a taste profile summary from the user's rated games.
 */
export async function getTasteProfile(): Promise<{
  topGenres: { genre: string; count: number }[];
  topRatedCount: number;
  backlogCount: number;
  avgRating: number;
  topRatedGames: { title: string; rating: number; coverUrl?: string }[];
}> {
  const allGames = await db.games.toArray();
  const allLogs = await db.logs.toArray();
  const logMap = new Map<number, Log>();
  allLogs.forEach((l) => logMap.set(l.igdbId, l));

  const topRated = allGames.filter((g) => {
    const l = logMap.get(g.igdbId);
    return l && (l.rating ?? 0) >= 4.0;
  });

  const backlogCount = allLogs.filter(
    (l) => l.status === "Backlog" || l.status === "Wishlist"
  ).length;

  const genreCounts: Record<string, number> = {};
  topRated.forEach((g) => {
    g.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
    });
  });

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  const ratings = topRated.map((g) => logMap.get(g.igdbId)?.rating ?? 0).filter((r) => r > 0);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const topRatedGames = topRated
    .map((g) => ({
      title: g.title,
      rating: logMap.get(g.igdbId)?.rating ?? 0,
      coverUrl: g.coverUrl,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return { topGenres, topRatedCount: topRated.length, backlogCount, avgRating, topRatedGames };
}
