import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Doc, Section } from './Docs';
import { CoverCard, type CoverCardGame } from '../components/CoverCard';
import { StatusChip, STATUS_COLORS } from '../components/ui/StatusChip';
import { StarRatingInput } from '../components/ui/StarRating';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import type { Status } from '../types';

const samples: CoverCardGame[] = [
 { igdbId: 1, title: 'Hollow Knight', platform: 'PC', releaseYear: 2017, status: 'Played', rating: 4.5, coverColor: 'var(--apple-purple-subtle)' },
 { igdbId: 2, title: 'Hades', platform: 'PC', releaseYear: 2020, status: 'Playing', rating: 4, coverColor: 'var(--apple-red-subtle)' },
 { igdbId: 3, title: 'Celeste', platform: 'Nintendo Switch', releaseYear: 2018, status: 'Backlog', coverColor: 'var(--apple-blue-subtle)' },
 { igdbId: 4, title: 'Outer Wilds', platform: 'PC', releaseYear: 2019, status: 'Backlog', coverColor: 'var(--apple-orange-subtle)' },
];
function LibraryDemo() {
 const [games, setGames] = useState(samples);
 const [filter, setFilter] = useState<Status | 'All'>('All');
 const [selected, setSelected] = useState<CoverCardGame | null>(null);
 const [rating, setRating] = useState(3);
 const [message, setMessage] = useState('');
 const visible = games.filter(g => filter === 'All' || g.status === filter);
 const open = (id: number) => { const game = games.find(g => g.igdbId === id)!; setSelected(game); setRating(game.rating ?? 3); };
 return <Doc eyebrow="Patterns / Library" title="Choose what to play." intro="An interactive composition of real components. Filter the sample collection, change a status, or open a game to save a rating.">
 <Section title="Your library"><div className="demo"><div className="row">{(['All', 'Wishlist', 'Backlog', 'Playing', 'Played'] as const).map(s => <StatusChip key={s} label={s} dotColor={s === 'All' ? undefined : STATUS_COLORS[s]} active={filter === s} count={games.filter(g => s === 'All' || g.status === s).length} onClick={() => setFilter(s)} />)}</div>
 {visible.length ? <div className="game-grid">{visible.map(game => <CoverCard key={game.igdbId} game={game} onClick={open} onLog={open} onRate={(id, value) => { setGames(prev => prev.map(g => g.igdbId === id ? { ...g, rating: value } : g)); setMessage('Rating updated.'); }} onChangeStatus={(id, status) => { setGames(prev => prev.map(g => g.igdbId === id ? { ...g, status } : g)); setMessage('Status updated.'); }} />)}</div> : <div className="stack" style={{ padding: '40px 0' }}><h3>No games in {filter.toLowerCase()} yet.</h3><p>Try another status to explore the collection.</p><Button variant="secondary" onClick={() => setFilter('All')}>Show all games</Button></div>}
 <p role="status" style={{ marginTop: 24 }}>{message}</p></div></Section>
 <Section title="Why this pattern"><p>Stable filters keep the organizing model visible as the collection changes. The empty state offers a direct recovery. Status and rating remain independent so an in-progress game can already have a personal assessment.</p><p className="note">Sample data lives in this example only. Artwork-free tiles exercise the actual fallback state. The current card maps Played to Completed in its metadata; the Decisions page records that inconsistency.</p></Section>
 <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `Rate ${selected.title}` : 'Rate game'}><div style={{ padding: 24, display: 'grid', gap: 20 }}><p>Your rating</p><StarRatingInput value={rating} onChange={setRating} /><output>{rating.toFixed(1)} / 5</output><div style={{ display: 'flex', gap: 12 }}><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button onClick={() => { setGames(prev => prev.map(g => g.igdbId === selected?.igdbId ? { ...g, rating } : g)); setMessage(`Saved ${rating.toFixed(1)} stars for ${selected?.title}.`); setSelected(null); }}>Save rating</Button></div></div></Modal>
 </Doc>;
}
const meta = { title: 'Patterns/Library', component: LibraryDemo, parameters: { layout: 'fullscreen', controls: { disable: true } } } satisfies Meta<typeof LibraryDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Browse: Story = {};
export const EmptyStateRecovery: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: /Wishlist/ })); await expect(c.getByText('No games in wishlist yet.')).toBeVisible(); await userEvent.click(c.getByRole('button', { name: 'Show all games' })); await expect(c.getByRole('button', { name: 'All 4' })).toHaveAttribute('aria-pressed', 'true'); } };
export const SaveRating: Story = { play: async ({ canvasElement }) => { const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: /Hades, Status/ })); const slider = await c.findByRole('slider', { name: 'Rating' }); slider.focus(); await userEvent.keyboard('{ArrowRight}'); await expect(slider).toHaveAttribute('aria-valuenow', '4.5'); await userEvent.click(c.getByRole('button', { name: 'Save rating' })); await expect(c.getByRole('status')).toHaveTextContent('Saved 4.5 stars for Hades.'); await expect(c.queryByRole('dialog')).not.toBeInTheDocument(); } };
