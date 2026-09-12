import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Sidebar } from "./shell/Sidebar";
import { LibraryScreen } from "./screens/Library/LibraryScreen";
import { DebugStoreScreen } from "./screens/DebugStore/DebugStoreScreen";
import { GlobalSearch } from "./shell/GlobalSearch";
import { AddGameModal } from "./screens/Library/AddGameModal";
import { LogEditor } from "./screens/LogEditor";
import { GameDetailScreen } from "./screens/GameDetail/GameDetailScreen";
import { RelatedGamesPage } from "./screens/GameDetail/RelatedGamesPage";
import { ListsScreen } from "./screens/Lists/ListsScreen";
import { SingleListScreen } from "./screens/Lists/SingleListScreen";
import { AddToListSheet } from "./screens/Lists/AddToListSheet";
import { StatsScreen } from "./screens/Stats/StatsScreen";
import { RecommendScreen } from "./screens/Recommend/RecommendScreen";
import { SettingsScreen } from "./screens/Settings";
import { ImportReviewScreen } from "./screens/ImportReview/ImportReviewScreen";
import { SearchScreen } from "./screens/Search";
import { SystemsScreen } from "./screens/Systems/SystemsScreen";
import { FriendsScreen } from "./screens/Friends/FriendsScreen";
import { ActivityScreen } from "./screens/Activity/ActivityScreen";
import { CommandPalette } from "./components/layout";
import { applyTheme } from "./services/theme";
import { db } from "./db/schema";
import { GamesRepo } from "./db/repositories/GamesRepo";
import type { Game, Log } from "./types";
import "./styles/index.css";

interface LogEditorTarget {
  game: Game;
  log: Log;
  prefill?: Partial<Log>;
}

function SingleListRoute({ onOpenGame }: { onOpenGame: (igdbId: number) => void }) {
  const { listId } = useParams();
  const navigate = useNavigate();
  if (!listId) return null;
  return (
    <SingleListScreen listId={listId} onBack={() => navigate("/lists")} onOpenGame={onOpenGame} />
  );
}

function AppInner() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    applyTheme();
  }, []);

  // Dynamic page title — WCAG 2.4.2
  useEffect(() => {
    const PATH_TITLES: Record<string, string> = {
      "/": "Library",
      "/lists": "Lists",
      "/systems": "Browse Systems",
      "/recommend": "What to Play",
      "/activity": "Activity",
      "/friends": "Friends",
      "/stats": "Stats",
      "/settings": "Settings",
      "/search": "Search",
      "/import/steam": "Import from Steam",
    };
    const base = "gamelog";
    // Match dynamic routes first, fall back to static map
    if (location.pathname.startsWith("/game/")) {
      document.title = `Game Detail — ${base}`;
    } else if (location.pathname.startsWith("/lists/")) {
      document.title = `List — ${base}`;
    } else if (location.pathname.startsWith("/systems/")) {
      document.title = `System — ${base}`;
    } else {
      const label = PATH_TITLES[location.pathname];
      document.title = label ? `${label} — ${base}` : base;
    }
  }, [location.pathname]);

  // Run backfill for missing embeddings and dates
  useEffect(() => {
    GamesRepo.backfillEmbeddings();
    GamesRepo.backfillReleaseDates();
  }, []);

  // Mac trackpad swipe-to-navigate
  useEffect(() => {
    let lastTime = 0;
    const handleWheel = (e: WheelEvent) => {
      // Must be primarily horizontal and a significant swipe
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 40) {
        const now = Date.now();
        if (now - lastTime < 600) return; // Debounce

        // Ensure we are not scrolling a horizontal container (e.g. Related Games)
        let target = e.target as HTMLElement | null;
        let isScrollable = false;
        while (target && target !== document.body) {
          const style = window.getComputedStyle(target);
          if (style.overflowX === "auto" || style.overflowX === "scroll") {
            if (target.scrollWidth > target.clientWidth) {
              // Check if we are not at the extreme edge
              if (e.deltaX < 0 && target.scrollLeft > 0) isScrollable = true;
              if (e.deltaX > 0 && target.scrollLeft + target.clientWidth < target.scrollWidth - 1)
                isScrollable = true;
              if (isScrollable) break;
            }
          }
          target = target.parentElement;
        }

        if (isScrollable) return;

        if (e.deltaX < -40 && window.history.length > 1) {
          // Swipe left-to-right to go BACK
          navigate(-1);
          lastTime = now;
        } else if (e.deltaX > 40) {
          // Swipe right-to-left to go FORWARD
          navigate(1);
          lastTime = now;
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [navigate]);

  const [searchParams, setSearchParams] = useSearchParams();

  const addGameOpen = searchParams.get("add-game") === "true";
  const [logEditorTarget, setLogEditorTarget] = useState<LogEditorTarget | null>(null);
  const [prefillState, setPrefillState] = useState<Partial<Log> | undefined>(undefined);
  const addToListIgdbId = searchParams.get("add-to-list");
  const addToListTitle = searchParams.get("list-title") || "";

  useEffect(() => {
    const handleOpenAdd = () => {
      setSearchParams((prev) => {
        prev.set("add-game", "true");
        return prev;
      });
    };
    window.addEventListener("gamelog:open-add-game", handleOpenAdd);
    return () => window.removeEventListener("gamelog:open-add-game", handleOpenAdd);
  }, [setSearchParams]);

  const openAddGame = () => {
    setSearchParams((prev) => {
      prev.set("add-game", "true");
      return prev;
    });
  };

  const closeAddGame = () => {
    setSearchParams((prev) => {
      prev.delete("add-game");
      return prev;
    });
  };

  const logIdParam = searchParams.get("log");
  useEffect(() => {
    let mounted = true;
    if (logIdParam) {
      const id = parseInt(logIdParam, 10);
      if (!isNaN(id)) {
        Promise.all([db.games.get(id), db.logs.get(id)]).then(([game, log]) => {
          if (mounted && game && log) {
            setLogEditorTarget({ game, log, prefill: prefillState });
          }
        });
      }
    } else {
      setLogEditorTarget(null);
    }
    return () => {
      mounted = false;
    };
  }, [logIdParam, prefillState]);

  const openLogEditor = async (igdbId: number, prefill?: Partial<Log>) => {
    setPrefillState(prefill);
    setSearchParams((prev) => {
      prev.set("log", igdbId.toString());
      return prev;
    });
  };

  const closeLogEditor = () => {
    setSearchParams((prev) => {
      prev.delete("log");
      return prev;
    });
    setPrefillState(undefined);
  };

  const openAddToList = (igdbId: number, title: string) => {
    setSearchParams((prev) => {
      prev.set("add-to-list", igdbId.toString());
      prev.set("list-title", title);
      return prev;
    });
  };

  const closeAddToList = () => {
    setSearchParams((prev) => {
      prev.delete("add-to-list");
      prev.delete("list-title");
      return prev;
    });
  };

  const openGame = (igdbId: number) => navigate(`/game/${igdbId}`);

  return (
    <div className="w-full h-full flex-row" style={{ overflow: "hidden" }}>
      {/* Skip to main content — WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar onAddGame={openAddGame} />

      <Routes>
        <Route
          path="/"
          element={
            <LibraryScreen
              onAddGame={openAddGame}
              onOpenLog={openLogEditor}
              onOpenGame={openGame}
            />
          }
        />
        <Route
          path="/search"
          element={<SearchScreen onOpenGame={openGame} onOpenLog={openLogEditor} />}
        />
        <Route
          path="/lists"
          element={<ListsScreen onOpenList={(id) => navigate(`/lists/${id}`)} />}
        />
        <Route path="/lists/:listId" element={<SingleListRoute onOpenGame={openGame} />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/recommend" element={<RecommendScreen />} />
        <Route path="/activity" element={<ActivityScreen />} />
        <Route path="/friends" element={<FriendsScreen />} />
        <Route
          path="/systems"
          element={<SystemsScreen onOpenGame={openGame} onOpenLog={openLogEditor} />}
        />
        <Route
          path="/systems/:platformId"
          element={<SystemsScreen onOpenGame={openGame} onOpenLog={openLogEditor} />}
        />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/import/steam" element={<ImportReviewScreen />} />
        <Route path="/debug" element={<DebugStoreScreen />} />
        <Route
          path="/game/:igdbId"
          element={
            <GameDetailScreen
              onOpenLog={openLogEditor}
              onOpenGame={openGame}
              onOpenAddToList={openAddToList}
            />
          }
        />
        <Route path="/game/:igdbId/related" element={<RelatedGamesPage onOpenGame={openGame} />} />
      </Routes>

      {location.pathname !== "/search" && (
        <GlobalSearch onGameAdded={(id, prefill) => openLogEditor(id, prefill)} />
      )}

      {/* Add Game modal */}
      {addGameOpen && (
        <AddGameModal
          onClose={closeAddGame}
          onGameAdded={(igdbId, prefill) => {
            closeAddGame();
            openLogEditor(igdbId, prefill);
          }}
        />
      )}

      {/* Log Editor modal */}
      {logEditorTarget && (
        <LogEditor
          game={logEditorTarget.game}
          log={logEditorTarget.log}
          prefill={logEditorTarget.prefill}
          onClose={closeLogEditor}
          onDelete={closeLogEditor}
        />
      )}

      {/* Add to list sheet */}
      {addToListIgdbId && (
        <AddToListSheet
          igdbId={parseInt(addToListIgdbId, 10)}
          title={addToListTitle}
          onClose={closeAddToList}
        />
      )}

      {/* ⌘K Command Palette */}
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
