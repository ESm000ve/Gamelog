import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { GamesRepo } from "../../db/repositories/GamesRepo";
import { LogsRepo } from "../../db/repositories/LogsRepo";
import { useLiveRegion } from "../../hooks/useLiveRegion";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { Game, Log, Status, Completion, Ownership } from "../../types";
import type { LogUpdate } from "../../db/repositories/LogsRepo";

import { LogEditorHeader } from "./LogEditorHeader";
import { LogEditorStatus } from "./LogEditorStatus";
import { LogEditorDetails } from "./LogEditorDetails";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEditorProps {
  game: Game;
  log: Log;
  prefill?: Partial<Log>;
  onClose: () => void;
  onDelete?: () => void;
}

type FormState = {
  status: Status;
  completion: Completion | undefined;
  completionPercentage: number | undefined;
  rating: number | undefined;
  platforms: string[];
  tagIds: string[];
  timePlayed: string;
  startedAt: string;
  finishedAt: string;
  ownership: Ownership[];
  notes: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LogEditor({ game, log, prefill, onClose, onDelete }: LogEditorProps) {
  const { announce } = useLiveRegion();
  const [form, setForm] = useState<FormState>(() => {
    // If prefill has a single platform, ensure it maps to platforms array.
    const prefillPlatforms =
      prefill?.platforms || (prefill?.platform ? [prefill.platform] : undefined);

    return {
      status: prefill?.status ?? log.status,
      completion: prefill?.completion ?? log.completion,
      completionPercentage: prefill?.completionPercentage ?? log.completionPercentage,
      rating: prefill?.rating ?? log.rating,
      platforms:
        prefillPlatforms ?? (log.platforms ? log.platforms : log.platform ? [log.platform] : []),
      tagIds: prefill?.tagIds ?? log.tagIds ?? [],
      timePlayed:
        prefill?.timePlayed !== undefined
          ? String(prefill.timePlayed)
          : log.timePlayed !== undefined
            ? String(log.timePlayed)
            : "",
      startedAt: prefill?.startedAt ?? log.startedAt ?? "",
      finishedAt: prefill?.finishedAt ?? log.finishedAt ?? "",
      ownership:
        prefill?.ownership ??
        (log.ownership ? (Array.isArray(log.ownership) ? log.ownership : [log.ownership]) : []),
      notes: prefill?.notes ?? log.notes ?? "",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Clear completion if status changes away from Played
  useEffect(() => {
    if (form.status !== "Played") {
      setForm((f) => ({ ...f, completion: undefined }));
    }
  }, [form.status]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(currentForm: FormState): Record<string, string> {
    const errs: Record<string, string> = {};

    const tp = parseFloat(currentForm.timePlayed);
    if (currentForm.timePlayed !== "" && (isNaN(tp) || tp < 0)) {
      errs.timePlayed = "Time played must be a non-negative number.";
    }

    if (currentForm.startedAt && currentForm.finishedAt) {
      if (new Date(currentForm.finishedAt) < new Date(currentForm.startedAt)) {
        errs.finishedAt = "Finished date can't be before started date.";
      }
    }

    return errs;
  }

  // Dynamic validation
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const currentErrors = validate(form);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      announce("Please fix the errors before saving.");
      return;
    }
    setSaving(true);

    // Ensure Game exists in our local catalog before writing the Log
    try {
      const exists = await GamesRepo.getById(game.igdbId);
      if (!exists) {
        await GamesRepo.upsert(game);
      }

      const updates: LogUpdate = {
        status: form.status,
        completion: form.status === "Played" ? form.completion : undefined,
        completionPercentage:
          form.status === "Playing" || form.status === "Played"
            ? form.completionPercentage
            : undefined,
        rating: form.rating,
        tagIds: form.tagIds,
        platforms: form.platforms,
        timePlayed: form.timePlayed !== "" ? parseFloat(form.timePlayed) : undefined,
        startedAt: form.startedAt || undefined,
        finishedAt: form.finishedAt || undefined,
        ownership: form.ownership,
        notes: form.notes,
        updatedAt: new Date().toISOString(),
      };

      await LogsRepo.update(game.igdbId, updates);
      announce("Log saved successfully.");
      onClose();
    } catch (e) {
      console.error(e);
      announce("Failed to save log. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await LogsRepo.delete(game.igdbId);
      announce(`${game.title} removed from library.`);
      onDelete?.();
      onClose();
    } catch (e) {
      console.error(e);
      announce("Failed to remove game.");
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (key: keyof FormState, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const toggleOwnership = (o: Ownership) => {
    setForm((f) => {
      const active = f.ownership.includes(o);
      const next = active ? f.ownership.filter((x) => x !== o) : [...f.ownership, o];
      return { ...f, ownership: next };
    });
  };

  const togglePlatform = (p: string) => {
    setForm((f) => {
      const active = f.platforms.includes(p);
      const next = active ? f.platforms.filter((x) => x !== p) : [...f.platforms, p];
      return { ...f, platforms: next };
    });
  };

  const hasSaveErrors = Object.keys(errors).length > 0;

  return (
    <Modal isOpen={true} onClose={onClose} width={470}>
      <LogEditorHeader game={game} onClose={onClose} />

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-5) var(--space-5) 0" }}>
        <LogEditorStatus
          status={form.status}
          completion={form.completion}
          completionPercentage={form.completionPercentage}
          rating={form.rating}
          onSet={set}
        />

        <LogEditorDetails
          game={game}
          platforms={form.platforms}
          timePlayed={form.timePlayed}
          startedAt={form.startedAt}
          finishedAt={form.finishedAt}
          ownership={form.ownership}
          tagIds={form.tagIds}
          notes={form.notes}
          errors={errors}
          onSet={set}
          togglePlatform={togglePlatform}
          toggleOwnership={toggleOwnership}
        />
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-5)",
          borderTop: "1px solid var(--apple-separator)",
          flexShrink: 0,
          marginTop: "var(--space-1)",
        }}
      >
        {confirmDelete ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: 500,
                color: "var(--apple-red)",
              }}
            >
              Remove this game from library?
            </span>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              style={{ color: "var(--apple-red)" }}
            >
              <Trash2 size={14} /> Remove from library
            </Button>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={hasSaveErrors}
                loading={saving}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
