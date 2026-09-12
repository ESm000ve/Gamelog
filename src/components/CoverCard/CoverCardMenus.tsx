import { StarRatingInput } from "../ui/StarRating";
import { STATUS_COLORS } from "../ui/StatusChip";
import type { Status } from "../../types";
import "./CoverCardParts.css";

interface StatusMenuProps {
  igdbId: number;
  onChangeStatus?: (igdbId: number, status: Status) => void;
  onClose: () => void;
}

export function StatusContextMenu({ igdbId, onChangeStatus, onClose }: StatusMenuProps) {
  return (
    <div className="card-context-menu card-status-menu" onClick={(e) => e.stopPropagation()}>
      {(["Wishlist", "Backlog", "Playing", "Played"] as Status[]).map((s) => (
        <button
          key={s}
          type="button"
          className="card-menu-item"
          onClick={(e) => {
            e.stopPropagation();
            onChangeStatus?.(igdbId, s);
            onClose();
          }}
        >
          <div className="card-menu-item-dot" style={{ background: STATUS_COLORS[s] }} />
          {s}
        </button>
      ))}
    </div>
  );
}

interface RateMenuProps {
  igdbId: number;
  rating?: number;
  onRate?: (igdbId: number, rating: number) => void;
  onClose: () => void;
}

export function RateContextMenu({ igdbId, rating, onRate, onClose }: RateMenuProps) {
  return (
    <div className="card-context-menu card-rate-menu" onClick={(e) => e.stopPropagation()}>
      <span className="card-rate-menu-label">Set Rating</span>
      <StarRatingInput
        size={22}
        value={rating ?? 0}
        onChange={(val) => {
          onRate?.(igdbId, val);
          onClose();
        }}
      />
    </div>
  );
}
