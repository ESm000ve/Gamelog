import { TagSelect } from "../../components/ui/";
import type { Game, Ownership } from "../../types";
import { Field, PillButton } from "./LogEditorUI";

const OWNERSHIPS: Ownership[] = ["Physical", "Digital", "Subscription", "Borrowed"];

interface LogEditorDetailsProps {
  game: Game;
  platforms: string[];
  timePlayed: string;
  startedAt: string;
  finishedAt: string;
  ownership: Ownership[];
  tagIds: string[];
  notes: string;
  errors: Record<string, string>;
  onSet: (key: string, val: any) => void;
  togglePlatform: (p: string) => void;
  toggleOwnership: (o: Ownership) => void;
}

export function LogEditorDetails({
  game,
  platforms,
  timePlayed,
  startedAt,
  finishedAt,
  ownership,
  tagIds,
  notes,
  errors,
  onSet,
  togglePlatform,
  toggleOwnership,
}: LogEditorDetailsProps) {
  return (
    <>
      {/* ── Platforms ── */}
      {game.platforms.length > 0 && (
        <Field label="Platforms" id="platforms-group">
          <div
            role="group"
            aria-labelledby="platforms-group-label"
            style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
          >
            {game.platforms.map((p) => (
              <PillButton
                key={p}
                label={p}
                active={platforms.includes(p)}
                onClick={() => togglePlatform(p)}
              />
            ))}
          </div>
        </Field>
      )}

      {/* ── Time played ── */}
      <Field label="Time played" htmlFor="time-played-input" error={errors.timePlayed}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            id="time-played-input"
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            value={timePlayed}
            onChange={(e) => onSet("timePlayed", e.target.value)}
            style={{
              width: 100,
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              background: "var(--apple-fill)",
              border: `1px solid ${errors.timePlayed ? "var(--apple-red)" : "var(--apple-separator)"}`,
              color: "var(--apple-label)",
              fontSize: "var(--font-size-base)",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--apple-tertiary-label)" }}>
            hours
          </span>
        </div>
      </Field>

      {/* ── Dates ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: "var(--space-4)",
        }}
      >
        <Field label="Started" htmlFor="started-input" error={undefined}>
          <input
            id="started-input"
            type="date"
            value={startedAt}
            onChange={(e) => onSet("startedAt", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              background: "var(--apple-fill)",
              border: "1px solid var(--apple-separator)",
              color: "var(--apple-label)",
              fontSize: "var(--font-size-base)",
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </Field>
        <Field label="Finished" htmlFor="finished-input" error={errors.finishedAt}>
          <input
            id="finished-input"
            type="date"
            value={finishedAt}
            onChange={(e) => onSet("finishedAt", e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              background: "var(--apple-fill)",
              border: `1px solid ${errors.finishedAt ? "var(--apple-red)" : "var(--apple-separator)"}`,
              color: "var(--apple-label)",
              fontSize: "var(--font-size-base)",
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </Field>
      </div>

      {/* ── Ownership ── */}
      <Field label="Ownership" id="ownership-group">
        <div
          role="group"
          aria-labelledby="ownership-group-label"
          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
        >
          {OWNERSHIPS.map((o) => (
            <PillButton
              key={o}
              label={o}
              active={ownership.includes(o)}
              onClick={() => toggleOwnership(o)}
            />
          ))}
        </div>
      </Field>

      {/* ── Tags ── */}
      <Field label="Tags" id="tags-group">
        <TagSelect value={tagIds} onChange={(v) => onSet("tagIds", v)} />
      </Field>

      {/* ── Notes ── */}
      <Field label="Notes" htmlFor="notes-input">
        <textarea
          id="notes-input"
          rows={3}
          placeholder="Add a note…"
          value={notes}
          onChange={(e) => onSet("notes", e.target.value)}
          style={{
            width: "100%",
            padding: "var(--space-2) 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--apple-fill)",
            border: "1px solid var(--apple-separator)",
            color: "var(--apple-label)",
            fontSize: "var(--font-size-base)",
            resize: "vertical",
            outline: "none",
            minHeight: 72,
            lineHeight: 1.5,
            fontFamily: "var(--apple-font-text)",
          }}
        />
      </Field>
    </>
  );
}
