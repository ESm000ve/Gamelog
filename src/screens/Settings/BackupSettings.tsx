import { useRef, useState } from "react";
import { Download, Upload, AlertTriangle, CheckCircle2, Trash2, Database } from "lucide-react";
import { exportData, importData } from "../../services/backup";
import { Button } from "../../components/ui/Button";

export function BackupSettings() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmFile, setConfirmFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      await exportData();
    } catch (err: any) {
      setError(err.message || "Export failed");
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setConfirmFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async (mode: "merge" | "replace") => {
    if (!confirmFile) return;
    setImporting(true);
    setProgress(0);
    setError("");
    setSuccess(false);

    try {
      const text = await confirmFile.text();
      await importData(text, mode, (pct, msg) => {
        setProgress(pct);
        setStatusMsg(msg);
      });
      setSuccess(true);
      setStatusMsg("Import completed successfully!");
      setConfirmFile(null);
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <section
      style={{
        background: "var(--apple-fill)",
        borderRadius: "var(--radius-xl)",
        padding: 30,
        border: "1px solid var(--apple-separator)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "var(--space-4)" }}
      >
        <Database size={24} color="var(--apple-accent)" />
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600 }}>Data Backup & Restore</h2>
      </div>

      <p style={{ color: "var(--apple-secondary-label)", marginBottom: 30, lineHeight: 1.5 }}>
        Your data is stored locally in your browser's IndexedDB. You can export your library, logs,
        and lists to a portable JSON file. The export excludes heavy catalog data (like game
        summaries and covers) because they will be automatically re-fetched during import, keeping
        your backup file small and safe.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={18} />
          Export Backup
        </Button>

        <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          Import Backup...
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={onFileSelected}
          style={{ display: "none" }}
        />
      </div>

      {confirmFile && !importing && (
        <div
          style={{
            marginTop: 30,
            padding: "var(--space-5)",
            background: "rgba(255, 150, 0, 0.1)",
            border: "1px solid rgba(255, 150, 0, 0.3)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--apple-orange)",
              marginBottom: "var(--space-3)",
            }}
          >
            <AlertTriangle size={20} />
            <strong style={{ fontSize: "var(--font-size-lg)" }}>Import Confirmation</strong>
          </div>
          <p
            style={{
              color: "var(--apple-secondary-label)",
              marginBottom: "var(--space-5)",
              fontSize: 14,
            }}
          >
            You selected <strong>{confirmFile.name}</strong>. How would you like to apply this data?
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => handleImport("merge")}>
              Merge (Add & Update)
            </Button>
            <Button variant="danger" onClick={() => handleImport("replace")}>
              <Trash2 size={16} />
              Wipe & Replace
            </Button>
            <Button variant="ghost" onClick={() => setConfirmFile(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {importing && (
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "var(--space-2)",
              fontSize: 14,
              color: "var(--apple-secondary-label)",
            }}
          >
            <span>{statusMsg}</span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--apple-separator)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--apple-accent)",
                width: `${progress}%`,
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "var(--space-5)",
            padding: "var(--space-3)",
            background: "rgba(255,50,50,0.1)",
            color: "var(--apple-red)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            marginTop: "var(--space-5)",
            padding: "var(--space-3)",
            background: "rgba(50,200,50,0.1)",
            color: "var(--apple-green)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <CheckCircle2 size={18} />
          {statusMsg}
        </div>
      )}
    </section>
  );
}
