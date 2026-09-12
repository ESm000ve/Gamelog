import { Search, ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface SearchToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onBack: () => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  selectedCount: number;
  totalSelectable: number;
  onToggleSelectAll: () => void;
}

export function SearchToolbar({
  query,
  onQueryChange,
  onBack,
  selectMode,
  onToggleSelectMode,
  selectedCount,
  totalSelectable,
  onToggleSelectAll,
}: SearchToolbarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "var(--space-3) var(--space-8)",
        background: "var(--apple-toolbar-bg)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid var(--apple-separator)",
      }}
    >
      <Button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--apple-tertiary-label)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "var(--space-1)",
        }}
        aria-label="Back to Library"
      >
        <ChevronLeft size={20} />
      </Button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h1
          style={{
            fontFamily: "var(--apple-font-display)",
            fontSize: "var(--font-size-lg)",
            fontWeight: 600,
            color: "var(--apple-label)",
            letterSpacing: "-0.015em",
            lineHeight: 1,
          }}
        >
          Catalog Search
        </h1>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {selectMode && (
          <Button
            onClick={onToggleSelectAll}
            style={{
              background: "transparent",
              color: "var(--apple-accent)",
              border: "none",
              padding: "var(--space-1) var(--space-2)",
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {selectedCount > 0 && selectedCount === totalSelectable
              ? "Clear selection"
              : "Select all loaded"}
          </Button>
        )}

        <Button
          onClick={onToggleSelectMode}
          style={{
            background: selectMode ? "var(--apple-accent)" : "var(--apple-fill)",
            color: selectMode ? "white" : "var(--apple-label)",
            border: "1px solid var(--apple-separator)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-1) var(--space-3)",
            fontSize: "var(--font-size-base)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
        >
          {selectMode ? "Cancel" : "Select"}
        </Button>
      </div>

      <div style={{ position: "relative" }}>
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
          placeholder="Search catalog to bulk add games..."
          aria-label="Bulk Catalog Search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            paddingLeft: 30,
            paddingRight: 10,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: "var(--radius-sm)",
            background: "var(--apple-fill)",
            border: "1px solid var(--apple-separator)",
            color: "var(--apple-label)",
            fontSize: "var(--font-size-base)",
            width: 300,
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
