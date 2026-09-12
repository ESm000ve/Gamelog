import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarRating } from "./StarRating";

const meta = {
  title: "Components/StarRating/Display",
  component: StarRating,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Read-only rating display with one accessible label describing the value out of 5. Individual star icons are decorative. Numeric value visibility and icon size are configurable. Manual screen-reader verification remains separate from automated checks.",
      },
    },
  },
  argTypes: {
    rating: {
      control: { type: "range", min: 0, max: 5, step: 0.5 },
      description: "0–5 in 0.5 steps.",
    },
    size: {
      control: { type: "number", min: 8, max: 32 },
      description: "Icon size in px. Real usage: 11 (default, CoverCard-style contexts), 12 (LogEditor), 14 (GameDetailScreen).",
    },
    showValue: { control: "boolean" },
  },
  args: {
    rating: 4.5,
    size: 11,
    showValue: true,
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Interactive playground ────────────────────────────────────────────────────

export const Playground: Story = {};

// ─── Rating values ──────────────────────────────────────────────────────────────

export const WholeNumber: Story = {
  name: "Whole number (3.0)",
  args: { rating: 3 },
};

export const HalfStar: Story = {
  name: "Half star (3.5)",
  args: { rating: 3.5 },
};

export const ZeroRating: Story = {
  name: "Zero (0.0)",
  args: { rating: 0 },
};

export const PerfectRating: Story = {
  name: "Perfect (5.0)",
  args: { rating: 5 },
};

// ─── Value label ────────────────────────────────────────────────────────────────

export const WithoutValue: Story = {
  name: "Without numeric value",
  args: { showValue: false },
};

// ─── Sizes seen in real usage ───────────────────────────────────────────────────

export const DefaultSize: Story = {
  name: "Size 11 (default)",
  args: { size: 11 },
};

export const LogEditorSize: Story = {
  name: "Size 12 (LogEditor)",
  args: { size: 12 },
};

export const GameDetailSize: Story = {
  name: "Size 14 (GameDetailScreen)",
  args: { size: 14 },
};

// ─── Every 0.5 increment at once, for visual reference ────────────────────────

export const AllValues: Story = {
  parameters: { layout: "padded", controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {Array.from({ length: 11 }, (_, i) => i * 0.5).map((r) => (
        <StarRating key={r} rating={r} size={14} />
      ))}
    </div>
  ),
};
