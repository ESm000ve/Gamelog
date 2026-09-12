import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import themeSource from '../styles/theme.css?raw';
import { Doc, Section, Card } from './Docs';

// Extract names and source values at build time; never maintain a second token list.
const base = themeSource.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const tokens = Array.from(base.matchAll(/(--[\w-]+):\s*([^;]+);/g), ([, name, value]) => ({ name, value: value.trim() }));
function Swatch({ name }: { name: string }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const read = () => setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
    read(); const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });
    return () => observer.disconnect();
  }, [name]);
  return <Card title={name.replace('--apple-', '').replaceAll('-', ' ')}><div className="swatch" style={{ background: `var(${name})` }} /><code>{name}<br />{value}</code></Card>;
}
function ColorsPage() { return <Doc eyebrow="Foundations / Color" title="Roles, not isolated swatches." intro="The live semantic palette from theme.css. Switch the toolbar theme or accent to see the values change."><Section title="Surfaces, labels and meaning"><div className="grid">{tokens.filter(t => /^(#|rgba)/.test(t.value)).map(t => <Swatch key={t.name} name={t.name} />)}</div></Section><Section title="Use the role"><p>Use label tokens for text, surface tokens for hierarchy, separator tokens for boundaries, and the accent for actions. Status colors carry domain meaning independently of the user-selected accent.</p><p className="note">A token’s presence is not an accessibility guarantee. Check translucent colors against their actual surface; light-mode secondary labels and tertiary labels need particular review.</p></Section></Doc>; }
function TypographyPage() { return <Doc eyebrow="Foundations / Typography" title="Built for a desktop library." intro="SF Pro through the macOS system font stack; native platform fallbacks elsewhere."><Section title="The implemented scale"><div className="stack">{tokens.filter(t => t.name.startsWith('--font-size')).map(t => <article className="card" key={t.name}><code>{t.name} · {t.value}</code><p style={{ fontSize: `var(${t.name})`, color: 'var(--apple-label)', marginTop: 12 }}>Keep track of what you play.</p></article>)}</div></Section><Section title="Two scales, two jobs"><p>App components retain their compact 13 px default. These documentation pages use larger reading type for portfolio presentation. The Figma file uses the available SF Pro family; browser rendering follows the system stack.</p></Section></Doc>; }
function RhythmPage() { return <Doc eyebrow="Foundations / Rhythm" title="Space creates structure." intro="Spacing, shape and elevation values are read from the app stylesheet."><Section title="Spacing"><div className="stack">{tokens.filter(t => t.name.startsWith('--space')).map(t => <div className="row" key={t.name}><code style={{ width: 150 }}>{t.name} · {t.value}</code><div style={{ width: `calc(var(${t.name}) * 5)`, height: 16, borderRadius: 4, background: 'var(--apple-accent)' }} /></div>)}</div></Section><Section title="Corner radii"><div className="grid">{tokens.filter(t => t.name.startsWith('--radius')).map(t => <div className="card" style={{ borderRadius: `var(${t.name})` }} key={t.name}><code>{t.name} · {t.value}</code></div>)}</div></Section><Section title="Elevation"><div className="grid">{tokens.filter(t => t.name.startsWith('--shadow')).map(t => <div className="card" style={{ boxShadow: `var(${t.name})` }} key={t.name}><h3>{t.name}</h3><code>{t.value}</code></div>)}</div></Section><Section title="Motion"><p>Buttons transition in 120 ms; cover cards lift in 180 ms; skeletons pulse over two seconds. Test reduced motion separately. The button’s current spinner references a missing spin animation; that implementation gap is intentionally visible.</p></Section></Doc>; }
const meta = { title: 'Foundations/Tokens', parameters: { layout: 'fullscreen', controls: { disable: true } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Colors: Story = { render: () => <ColorsPage /> };
export const Typography: Story = { render: () => <TypographyPage /> };
export const SpacingAndElevation: Story = { render: () => <RhythmPage /> };
