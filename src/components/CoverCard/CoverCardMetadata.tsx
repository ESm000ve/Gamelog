import { Star } from "lucide-react";
import { StarRating } from "../ui/StarRating";
import { STATUS_COLORS, STATUS_SUBTLE } from "../ui/StatusChip";
import type { Status } from "../../types";
import { shortPlatform } from "../../utils/platforms";
import { StatusIcon } from "./CoverCardIcons";
import "./CoverCardMetadata.css";

interface CoverCardMetadataProps {
  platform?: string;
  releaseYear?: number;
  status?: Status;
  rating?: number;
}

export function CoverCardMetadata({
  platform,
  releaseYear,
  status,
  rating,
}: CoverCardMetadataProps) {
  return (
    <div className="card-metadata">
      {/* Row 1: System + Year */}
      <div className="card-metadata-platform">
        {[shortPlatform(platform), releaseYear].filter(Boolean).join(" · ")}
      </div>

      {/* Row 2: Status & Rating */}
      <div className="card-metadata-row">
        {status ? (
          <div
            className="card-metadata-status"
            style={{
              background: STATUS_SUBTLE[status] || "var(--apple-tertiary-bg)",
              color: STATUS_COLORS[status] || "var(--apple-secondary-label)",
            }}
          >
            <StatusIcon status={status} />
            {status === "Played" ? "Completed" : status}
          </div>
        ) : (
          <div />
        )}

        {typeof rating === "number" ? (
          <div className="card-metadata-rating">
            <StarRating rating={rating} size={12} showValue={true} />
          </div>
        ) : (
          <div className="card-metadata-rating" aria-label="Not rated">
            <Star size={12} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
