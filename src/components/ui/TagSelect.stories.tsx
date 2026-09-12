import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagSelect } from "./TagSelect";
import { setDemoTags } from "../../../.storybook/tags.fixture";
import type { Tag } from "../../types";

// Storybook resolves TagsRepo to an in-memory fixture; app data is untouched.
const SAMPLE_TAGS: Tag[] = [
  { id: "tag-cozy", name: "Cozy", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "tag-metroidvania", name: "Metroidvania", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "tag-coop", name: "Co-op", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "tag-story-rich", name: "Story-rich", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "tag-roguelike", name: "Roguelike", createdAt: Date.now(), updatedAt: Date.now() },
  { id: "tag-difficult", name: "Difficult", createdAt: Date.now(), updatedAt: Date.now() },
];

async function seedTags() {
  setDemoTags(SAMPLE_TAGS);
}

async function clearTags() {
  setDemoTags([]);
}

function Demo({ initialIds = [] as string[] }: { initialIds?: string[] }) {
  const [value, setValue] = useState<string[]>(initialIds);
  return (
    <div style={{ width: "min(360px, 100%)" }}>
      <TagSelect value={value} onChange={setValue} />
    </div>
  );
}

const meta = {
  title: "Components/TagSelect",
  component: TagSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { inline: false, height: 540 },
      description: {
        component:
          "The real TagSelect component uses a Storybook-only in-memory TagsRepo replacement. Demo tags never touch the app database. Type in the input to see autocomplete filtering, press Enter to create a new tag, or Backspace on an empty input to remove the last selected tag.",
      },
    },
  },
  loaders: [seedTags],
  // TagSelect is fully controlled; every story below drives value/onChange
  // through its own Demo wrapper (see the Modal stories for the same
  // pattern). These args exist only to satisfy the type checker.
  args: {
    value: [],
    onChange: () => {},
  },
} satisfies Meta<typeof TagSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Interactive playground ────────────────────────────────────────────────────

export const Playground: Story = {
  render: () => <Demo />,
};

// ─── Pre-selected tags ──────────────────────────────────────────────────────────

export const WithSelectedTags: Story = {
  name: "With tags already selected",
  render: () => <Demo initialIds={["tag-cozy", "tag-metroidvania"]} />,
};

// ─── Empty database — the "create new" path ────────────────────────────────────

export const NoExistingTags: Story = {
  name: "No tags in database yet",
  loaders: [clearTags],
  parameters: {
    docs: {
      description: {
        story:
          'With an empty tag table, typing anything shows only the "Create …" option — this is the first-run state for a fresh install.',
      },
    },
  },
  render: () => <Demo />,
};
