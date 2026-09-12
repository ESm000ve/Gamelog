import { X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { Game } from "../../types";

interface LogEditorHeaderProps {
  game: Game;
  onClose: () => void;
}

export function LogEditorHeader({ game, onClose }: LogEditorHeaderProps) {
  const coverThumb = game.coverUrl
    ? game.coverUrl.replace("t_cover_big", "t_cover_small")
    : undefined;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "var(--space-5) var(--space-5) var(--space-4)",
        borderBottom: "1px solid var(--apple-separator)",
        flexShrink: 0,
      }}
    >
      {/* Cover thumb */}
      {coverThumb ? (
        <img
          src={coverThumb}
          alt={game.title}
          style={{
            width: 44,
            height: 58,
            objectFit: "cover",
            borderRadius: "var(--radius-sm)",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 58,
            borderRadius: "var(--radius-sm)",
            background: game.coverColor ?? "var(--apple-tertiary-bg)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--apple-label)",
              textAlign: "center",
              padding: "var(--space-1)",
              lineHeight: 1.3,
            }}
          >
            {game.title}
          </span>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          id="log-editor-title"
          style={{
            fontFamily: "var(--apple-font-display)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--apple-label)",
            letterSpacing: "-0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {game.title}
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--apple-tertiary-label)",
            marginTop: 2,
          }}
        >
          {game.developer}
          {game.releaseYear ? ` · ${game.releaseYear}` : ""}
        </p>
      </div>

      <Button
        aria-label="Close"
        type="button"
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--apple-fill)",
          color: "var(--apple-secondary-label)",
          flexShrink: 0,
          transition: "background 120ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--apple-secondary-fill)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--apple-fill)")}
      >
        <X size={14} />
      </Button>
    </div>
  );
}
