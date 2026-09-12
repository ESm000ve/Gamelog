import { RefreshCw, Star, Edit3 } from "lucide-react";
import "./CoverCardParts.css";

interface CoverCardOverlayProps {
  igdbId: number;
  visible: boolean;
  onOpenStatusMenu: () => void;
  onOpenRateMenu: () => void;
  onLog?: (igdbId: number) => void;
}

const ACTIONS = [
  { Icon: RefreshCw, title: "Change status", key: "status" as const },
  { Icon: Star, title: "Rate", key: "rate" as const },
  { Icon: Edit3, title: "Log", key: "log" as const },
] as const;

export function CoverCardOverlay({
  igdbId,
  visible,
  onOpenStatusMenu,
  onOpenRateMenu,
  onLog,
}: CoverCardOverlayProps) {
  return (
    <div aria-hidden={!visible} className={`card-overlay ${visible ? "visible" : "hidden"}`}>
      <div className="card-overlay-actions">
        {ACTIONS.map(({ Icon, title, key }) => (
          <button
            key={key}
            type="button"
            title={title}
            aria-label={title}
            className="card-overlay-btn quick-action-btn"
            tabIndex={visible ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              if (key === "status") {
                onOpenStatusMenu();
              } else if (key === "log") {
                onLog?.(igdbId);
              } else if (key === "rate") {
                onOpenRateMenu();
              }
            }}
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
