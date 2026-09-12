import type { Tag } from '../src/types';
// Storybook-only repository replacement. Never opens the application's IndexedDB.
let tags: Tag[] = [];
export function setDemoTags(next: Tag[]) { tags = next.map(tag => ({ ...tag })); }
export const TagsRepo = {
  async getAll(): Promise<Tag[]> { return tags.map(tag => ({ ...tag })).sort((a, b) => a.name.localeCompare(b.name)); },
  async getOrCreate(name: string): Promise<Tag> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Tag name cannot be empty');
    const existing = tags.find(tag => tag.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return { ...existing };
    const tag = { id: crypto.randomUUID(), name: trimmed, createdAt: Date.now(), updatedAt: Date.now() };
    tags.push(tag);
    return { ...tag };
  },
};
