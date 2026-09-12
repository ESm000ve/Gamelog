import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Check, Loader2 } from "lucide-react";
import { db } from "../../db/schema";
import { ListsRepo } from "../../db/repositories/ListsRepo";
import { useLiveRegion } from "../../hooks/useLiveRegion";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

interface AddToListSheetProps {
  igdbId: number;
  title: string;
  onClose: () => void;
}

export function AddToListSheet({ igdbId, title, onClose }: AddToListSheetProps) {
  const lists = useLiveQuery(() => db.lists.orderBy("createdAt").reverse().toArray());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { announce } = useLiveRegion();

  // Which lists already contain this game
  const memberIds = new Set(
    (lists ?? []).filter((l) => l.gameIds.includes(igdbId)).map((l) => l.id)
  );

  const toggle = async (listId: string) => {
    setLoadingId(listId);
    if (memberIds.has(listId)) {
      await ListsRepo.removeGame(listId, igdbId);
      announce(`Removed from list`);
    } else {
      await ListsRepo.addGame(listId, igdbId);
      announce(`Added to list`);
    }
    setLoadingId(null);
  };

  const createAndAdd = async () => {
    const name = newName.trim() || `${title} list`;
    const id = await ListsRepo.create(name);
    await ListsRepo.addGame(id, igdbId);
    setCreating(false);
    setNewName("");
    announce(`Created list ${name} and added game`);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add to list" width={380}>
      {/* Subtitle */}
      <div
        style={{
          padding: "0 var(--space-5) var(--space-3)",
          borderBottom: "1px solid var(--apple-separator)",
        }}
      >
        <p style={{ fontSize: 13, color: "var(--apple-secondary-label)", margin: 0 }}>{title}</p>
      </div>

      {/* Lists */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 150 }}>
        {lists === undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-6)",
            }}
          >
            <Loader2 size={16} color="var(--apple-tertiary-label)" />
          </div>
        )}

        {lists?.length === 0 && !creating && (
          <p
            style={{
              padding: "var(--space-4) var(--space-5)",
              fontSize: "var(--font-size-base)",
              color: "var(--apple-tertiary-label)",
              textAlign: "center",
            }}
          >
            No lists yet. Create one below.
          </p>
        )}

        {(lists ?? []).map((list) => {
          const inList = memberIds.has(list.id);
          const loading = loadingId === list.id;
          return (
            <Button
              key={list.id}
              onClick={() => toggle(list.id)}
              aria-pressed={inList}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px var(--space-5)",
                background: "transparent",
                color: "var(--apple-label)",
                fontSize: "var(--font-size-base)",
                textAlign: "left",
                borderBottom: "1px solid var(--apple-separator)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--apple-fill)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "var(--radius-sm)",
                  background: inList ? "var(--apple-accent)" : "var(--apple-fill)",
                  border: `1px solid ${inList ? "var(--apple-accent)" : "var(--apple-separator)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 120ms ease",
                }}
              >
                {loading ? (
                  <Loader2 size={10} color="var(--apple-accent-foreground)" aria-hidden="true" />
                ) : inList ? (
                  <Check size={11} color="var(--apple-accent-foreground)" aria-hidden="true" />
                ) : null}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {list.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--apple-tertiary-label)", marginTop: 1 }}>
                  {list.gameIds.length} {list.gameIds.length === 1 ? "game" : "games"}
                </p>
              </div>
            </Button>
          );
        })}

        {/* New list inline form */}
        {creating ? (
          <div
            style={{
              padding: "10px var(--space-5)",
              display: "flex",
              gap: 8,
              borderBottom: "1px solid var(--apple-separator)",
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createAndAdd();
                if (e.key === "Escape") setCreating(false);
              }}
              placeholder="List name…"
              aria-label="New list name"
              style={{
                flex: 1,
                padding: "5px 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--apple-fill)",
                border: "1px solid var(--apple-accent)",
                color: "var(--apple-label)",
                fontSize: "var(--font-size-base)",
                outline: "none",
              }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={createAndAdd}
              style={{
                padding: "5px var(--space-3)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Create
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreating(false)}
              aria-label="Cancel new list"
              style={{
                padding: "5px var(--space-2)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setCreating(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "10px var(--space-5)",
              minHeight: 44,
              background: "transparent",
              color: "var(--apple-accent)",
              fontSize: "var(--font-size-base)",
              fontWeight: 500,
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--apple-fill)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Plus size={14} aria-hidden="true" /> New list
          </Button>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "var(--space-3) var(--space-5)",
          borderTop: "1px solid var(--apple-separator)",
          flexShrink: 0,
        }}
      >
        <Button
          variant="secondary"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "7px 0",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--font-size-base)",
          }}
        >
          Done
        </Button>
      </div>
    </Modal>
  );
}
