import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = { title: 'UI/Skeleton', component: Skeleton, tags: ['autodocs'], parameters: { docs: { description: { component: 'Reserves content geometry while loading. Width and height should match the content that follows. The source pulses opacity over 2 seconds; review reduced-motion behavior before use.' } } }, args: { width: 220, height: 16 } } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = {};
export const Heading: Story = { args: { width: 320, height: 32 } };
export const Cover: Story = { args: { width: 180, height: 240 } };
export const LibraryLoading: Story = { render: () => <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }} aria-label="Loading library">{[1, 2, 3, 4].map(id => <div key={id} style={{ display: 'grid', gap: 12 }}><Skeleton width={180} height={240} /><Skeleton width={140} height={12} /><Skeleton width={100} height={12} /></div>)}</div> };
