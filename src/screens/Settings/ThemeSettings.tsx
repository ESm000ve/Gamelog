import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { ACCENT_OPTIONS, type ThemeMode, type AccentColor } from "../../services/theme";
import "./Settings.css";

interface ThemeSettingsProps {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  onThemeModeChange: (mode: ThemeMode) => void;
  onAccentColorChange: (color: AccentColor) => void;
}

const THEME_MODES: { key: ThemeMode; label: string; Icon: React.ElementType }[] = [
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "light", label: "Light", Icon: Sun },
  { key: "system", label: "System", Icon: Monitor },
];

export function ThemeSettings({
  themeMode,
  accentColor,
  onThemeModeChange,
  onAccentColorChange,
}: ThemeSettingsProps) {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <Palette size={24} color="var(--apple-accent)" />
        <h2>Appearance &amp; Customization</h2>
      </div>

      <p className="settings-card-description">
        Personalize your library&apos;s look and feel by choosing an accent color and selecting your
        preferred color theme.
      </p>

      {/* Accent Color Swatches */}
      <div>
        <div className="settings-field-label">Accent Color</div>
        <div className="settings-accent-grid">
          {ACCENT_OPTIONS.map((opt) => {
            const isSelected = accentColor === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onAccentColorChange(opt.id)}
                aria-label={`Select ${opt.name} accent`}
                aria-pressed={isSelected}
                className={`settings-accent-swatch ${isSelected ? "selected" : ""}`}
                style={{
                  background: isSelected ? `${opt.hex}22` : undefined,
                  border: isSelected ? `2px solid ${opt.hex}` : undefined,
                  color: isSelected ? opt.hex : undefined,
                  boxShadow: isSelected ? `0 0 12px ${opt.hex}44` : undefined,
                }}
              >
                <span className="settings-accent-swatch-dot" style={{ background: opt.hex }} />
                {opt.name}
                {isSelected && (
                  <Check size={12} aria-hidden="true" style={{ marginLeft: "auto" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Mode Toggle */}
      <div>
        <div className="settings-field-label">Color Theme</div>
        <div className="settings-theme-toggle">
          {THEME_MODES.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onThemeModeChange(key)}
              className={`settings-theme-btn ${themeMode === key ? "active" : ""}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
