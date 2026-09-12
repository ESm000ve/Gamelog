import { NavLink } from "react-router-dom";
import {
  Grid2x2,
  List,
  BarChart2,
  Plus,
  Gamepad2,
  Sparkles,
  Settings,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import "./Sidebar.css";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { to: "/", label: "Library", Icon: Grid2x2 },
  { to: "/lists", label: "Lists", Icon: List },
  { to: "/systems", label: "Browse Systems", Icon: Gamepad2 },
  { to: "/recommend", label: "What to Play", Icon: Sparkles },
  { to: "/activity", label: "Activity", Icon: Calendar },
  { to: "/friends", label: "Friends", Icon: Users },
  { to: "/stats", label: "Stats", Icon: BarChart2 },
  { to: "/settings", label: "Settings", Icon: Settings },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  onAddGame: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({ onAddGame }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logo mark */}
      <div className="sidebar-logo">
        <div aria-hidden="true" className="sidebar-logo-icon">
          <Gamepad2 size={16} color="var(--apple-accent-foreground)" />
        </div>
        <span className="text-display" style={{ fontSize: 16 }}>
          gamelog
        </span>
      </div>

      <nav aria-label="Main navigation" className="sidebar-nav">
        {NAV.map(({ to, label, Icon }) => (
          <SidebarNavItem key={to} to={to} label={label} Icon={Icon} />
        ))}
      </nav>

      {/* Add game CTA */}
      <div className="sidebar-add-game">
        <AddGameButton onClick={onAddGame} />
      </div>
    </aside>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function SidebarNavItem({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: React.ElementType;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            aria-hidden="true"
            color={isActive ? "var(--apple-accent)" : "currentColor"}
          />
          {label}
          {isActive && <span className="sr-only"> (current page)</span>}
        </>
      )}
    </NavLink>
  );
}

// ─── Add game button ──────────────────────────────────────────────────────────

function AddGameButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      aria-label="Add game to library"
      className="w-full hover-scale"
      style={{
        borderRadius: "var(--radius-lg)",
        fontFamily: "var(--apple-font-text)",
        fontSize: "var(--font-size-base)",
        fontWeight: 500,
      }}
    >
      <Plus size={15} aria-hidden="true" />
      Add game
    </Button>
  );
}
