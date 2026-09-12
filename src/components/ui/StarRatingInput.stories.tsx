import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarRatingInput } from "./StarRating";

interface DemoProps {
  initial?: number;
  size?: number;
}

// StarRatingInput is fully controlled (value/onChange owned by the caller),
// so every story wraps it in a small stateful demo and shows the live value
// next to it — useful for confirming clicks, hover-preview, and the keyboard
// (arrow keys / Home / End) all land on the value they claim to.
function Demo({ initial = 0, size = 26 }: DemoProps) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
      <StarRatingInput value={value} onChange={setValue} size={size} />
      <span style={{ color: "var(--apple-secondary-label)", fontSize: "var(--font-size-base)", fontVariantNumeric: "tabular-nums" }}>
        {value.toFixed(1)} / 5
      </span>
    </div>
  );
}

const meta = {
  title: "Components/StarRating/Input",
  component: StarRatingInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controlled half-step rating input using role=slider. Arrow keys change the value by 0.5; Home selects 0.5 and End selects 5. The unset value of 0 currently falls below aria-valuemin=0.5 and remains an implementation gap.",
      },
    },
  },
  // value/onChange are owned by each story's Demo wrapper, not by args — see
  // the Modal stories for the same pattern and why.
  args: {
    value: 0,
    onChange: () => {},
  },
} satisfies Meta<typeof StarRatingInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Interactive playground ────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => <Demo initial={3} />,
};

// ─── Starting values ────────────────────────────────────────────────────────────

export const Unrated: Story = {
  name: "Unrated (0)",
  render: () => <Demo initial={0} />,
};

export const HalfStarStart: Story = {
  name: "Starts at 3.5",
  render: () => <Demo initial={3.5} />,
};

export const FullStart: Story = {
  name: "Starts at 5 (max)",
  render: () => <Demo initial={5} />,
};

// ─── Sizes seen in real usage ───────────────────────────────────────────────────

export const CoverCardSize: Story = {
  name: "Size 22 (CoverCard rate popover)",
  render: () => <Demo initial={2.5} size={22} />,
};

export const LogEditorSize: Story = {
  name: "Size 24 (LogEditor)",
  render: () => <Demo initial={4} size={24} />,
};

export const DefaultSize: Story = {
  name: "Size 26 (default)",
  render: () => <Demo initial={2} size={26} />,
};

// ─── Keyboard behavior note ─────────────────────────────────────────────────────

export const KeyboardNavigation: Story = {
  name: "Keyboard navigation (try it)",
  parameters: {
    docs: {
      description: {
        story:
          "Tab to the slider, then use ArrowLeft/ArrowRight (±0.5), Home (0.5), and End (5). aria-valuenow follows the controlled value.",
      },
    },
  },
  render: () => <Demo initial={2.5} />,
};
