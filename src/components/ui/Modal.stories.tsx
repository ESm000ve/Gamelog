import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Modal } from './Modal';
import { Button } from './Button';

function Demo({ title = 'Edit details', width = 470, long = false, custom = false }: { title?: string; width?: number; long?: boolean; custom?: boolean }) {
 const [open, setOpen] = useState(false);
 const [message, setMessage] = useState('');
 return <div><Button onClick={() => setOpen(true)}>Open modal</Button><p role="status" style={{ marginTop: 16 }}>{message}</p><Modal isOpen={open} onClose={() => setOpen(false)} title={custom ? undefined : title} width={width}>
 <div style={{ padding: 24, display: 'grid', gap: 16 }}>{custom && <h2>Custom task heading</h2>}{Array.from({ length: long ? 16 : 1 }, (_, i) => <p key={i}>This is demonstration content. Try Tab, Shift+Tab, Escape, the backdrop, or the actions below.</p>)}<div style={{ display: 'flex', gap: 12 }}><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { setMessage('Example saved.'); setOpen(false); }}>Save</Button></div></div>
 </Modal></div>;
}
const meta = { title: 'UI/Modal', component: Modal, tags: ['autodocs'], parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 500 }, description: { component: 'Controlled modal shell with title, flexible width, Escape and backdrop dismissal, and focus management. Each example begins closed. Save and Cancel demonstrate consumer-owned actions; no app data is written.' } } }, args: { isOpen: false, onClose: () => {}, children: null }, argTypes: { isOpen: { control: false }, onClose: { control: false }, children: { control: false } } } satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithTitle: Story = { render: () => <Demo /> };
export const WithoutTitle: Story = { name: 'Custom content without shell title', render: () => <Demo custom />, parameters: { docs: { description: { story: 'Known gap: a visible custom heading does not automatically name the dialog. The shell only sets aria-labelledby when its title prop is supplied. Prefer the titled configuration until an explicit naming API is provided.' } } } };
export const Narrow: Story = { render: () => <Demo title="Confirm a change" width={320} /> };
export const Wide: Story = { render: () => <Demo title="Import settings" width={640} /> };
export const LongContent: Story = { render: () => <Demo title="Long content" long /> };
export const Closed: Story = { render: () => <Demo /> };
export const KeyboardDismissal: Story = { render: () => <Demo />, play: async ({ canvasElement }) => { const c = within(canvasElement); const trigger = c.getByRole('button', { name: 'Open modal' }); await userEvent.click(trigger); await expect(await c.findByRole('dialog')).toBeVisible(); await userEvent.keyboard('{Escape}'); await expect(c.queryByRole('dialog')).not.toBeInTheDocument(); await new Promise(resolve => setTimeout(resolve, 40)); await expect(trigger).toHaveFocus(); } };
