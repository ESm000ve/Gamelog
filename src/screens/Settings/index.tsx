import { useState } from "react";
import {
  getStoredThemeMode,
  setStoredThemeMode,
  getStoredAccentColor,
  setStoredAccentColor,
  type ThemeMode,
  type AccentColor,
} from "../../services/theme";
import { ThemeSettings } from "./ThemeSettings";
import { BackupSettings } from "./BackupSettings";
import { ImportSettings } from "./ImportSettings";

export function SettingsScreen() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => getStoredAccentColor());

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setStoredThemeMode(mode);
  };

  const handleAccentColorChange = (color: AccentColor) => {
    setAccentColorState(color);
    setStoredAccentColor(color);
  };

  return (
    <div
      style={{
        padding: "var(--space-10) 60px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--apple-font-display)",
          fontSize: "var(--font-size-3xl)",
          fontWeight: 700,
          marginBottom: "var(--space-10)",
        }}
      >
        Settings
      </h1>

      <ThemeSettings
        themeMode={themeMode}
        accentColor={accentColor}
        onThemeModeChange={handleThemeModeChange}
        onAccentColorChange={handleAccentColorChange}
      />

      <BackupSettings />

      <ImportSettings />
    </div>
  );
}
