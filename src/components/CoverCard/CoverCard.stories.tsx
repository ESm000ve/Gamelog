import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CoverCard, type CoverCardGame } from "./index";

const BASE_GAME: CoverCardGame = {
  igdbId: 1,
  title: "Hollow Knight",
  status: "Played",
  rating: 4.5,
  coverColor: "var(--apple-purple-subtle)",
  platform: "PC (Microsoft Windows)",
  releaseYear: 2017,
};

const meta = {
  title: "Components/CoverCard",
  component: CoverCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grid tile used across the Library, Search, Systems, and Friends screens. Two fixed a11y bugs from an earlier pass of this audit: the clickable cover tile is a `div[role=\"button\"]` and now gets a real `:focus-visible` ring (extended globally in `globals.css`, since the app's ring previously only targeted real `button` elements); and the hover-revealed quick-action buttons (change status / rate / log) are no longer keyboard-focusable while hidden — `aria-hidden`, opacity, `pointerEvents`, and `tabIndex` are now all driven by one shared condition. **Hover or Tab onto a card in the canvas** to see the quick-actions overlay and the focus ring.",
      },
    },
  },
  argTypes: {
    onClick: { action: "clicked" },
    onChangeStatus: { action: "status changed" },
    onRate: { action: "rated" },
    onLog: { action: "logged" },
    onToggleSelect: { action: "toggled select" },
  },
  args: {
    game: BASE_GAME,
    selectable: false,
    selected: false,
  },
} satisfies Meta<typeof CoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Interactive playground ────────────────────────────────────────────────────

export const Playground: Story = {
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// ─── Cover art vs. text fallback ────────────────────────────────────────────────

export const WithCoverArt: Story = {
  name: "With cover image",
  args: {
    game: { ...BASE_GAME, coverUrl: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22%3E%3Crect width=%22300%22 height=%22400%22 fill=%22%233a3a3c%22/%3E%3Ctext x=%22150%22 y=%22200%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22 font-size=%2220%22%3ESample cover%3C/text%3E%3C/svg%3E" },
  },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

export const TextFallback: Story = {
  name: "No cover image (text fallback tile)",
  args: {
    game: { ...BASE_GAME, coverUrl: undefined, title: "Untitled Goose Game" },
  },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// ─── Every status ────────────────────────────────────────────────────────────────

export const AllStatuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 180px))", gap: "var(--space-4)" }}>
      {(["Wishlist", "Backlog", "Playing", "Played"] as const).map((status) => (
        <CoverCard
          key={status}
          game={{ ...BASE_GAME, igdbId: status.length, status, title: status, coverUrl: undefined }}
        />
      ))}
    </div>
  ),
};

export const NoStatus: Story = {
  name: "No status (unlogged)",
  args: {
    game: { ...BASE_GAME, status: undefined, rating: undefined, coverUrl: undefined },
  },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// ─── Rating ─────────────────────────────────────────────────────────────────────

export const Rated: Story = {
  args: { game: { ...BASE_GAME, rating: 4.5, coverUrl: undefined } },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

export const NotRated: Story = {
  args: { game: { ...BASE_GAME, rating: undefined, coverUrl: undefined } },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// ─── Selection mode ──────────────────────────────────────────────────────────────

export const SelectableUnselected: Story = {
  name: "Selectable (unselected)",
  args: { selectable: true, selected: false, game: { ...BASE_GAME, coverUrl: undefined } },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

export const SelectableSelected: Story = {
  name: "Selectable (selected)",
  args: { selectable: true, selected: true, game: { ...BASE_GAME, coverUrl: undefined } },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

export const SelectableGrid: Story = {
  name: "Realistic composition — multi-select grid",
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const games: CoverCardGame[] = [
        { ...BASE_GAME, igdbId: 1, title: "Hollow Knight", status: "Played", coverUrl: undefined },
        { ...BASE_GAME, igdbId: 2, title: "Celeste", status: "Playing", coverColor: "var(--apple-blue-subtle)", coverUrl: undefined },
        { ...BASE_GAME, igdbId: 3, title: "Outer Wilds", status: "Backlog", coverColor: "var(--apple-orange-subtle)", coverUrl: undefined },
        { ...BASE_GAME, igdbId: 4, title: "Disco Elysium", status: "Wishlist", coverColor: "var(--apple-pink-subtle)", coverUrl: undefined },
      ];
      const [selected, setSelected] = useState<Set<number>>(new Set([2]));
      const toggle = (id: number) => {
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      };
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 180px))", gap: "var(--space-4)" }}>
          {games.map((game) => (
            <CoverCard
              key={game.igdbId}
              game={game}
              selectable
              selected={selected.has(game.igdbId)}
              onToggleSelect={(id) => toggle(id)}
            />
          ))}
        </div>
      );
    }
    return <Demo />;
  },
};

// ─── Deal badge ─────────────────────────────────────────────────────────────────

export const WithDeal: Story = {
  name: "Deal badge",
  args: {
    game: {
      ...BASE_GAME,
      coverUrl: undefined,
      dealPrice: 7.49,
      dealUrl: "https://www.cheapshark.com/",
    },
  },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};

// ─── Completion progress ────────────────────────────────────────────────────────

export const InProgress: Story = {
  name: "Completion progress bar",
  args: {
    game: { ...BASE_GAME, status: "Playing", coverUrl: undefined, completionPercentage: 62 },
  },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};
