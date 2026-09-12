import type { ReactNode } from 'react';
import './catalog.css';

export const FIGMA = 'https://www.figma.com/design/Zhe33CP0LN0ubMcnn9xp8W?node-id=13-2';
export function Doc({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <main className="gl-doc"><header><p className="eyebrow">Gamelog / {eyebrow}</p><h1>{title}</h1><p className="lead">{intro}</p></header>{children}<footer className="footer"><p>Gamelog · Product design system · Source-backed, evolving documentation.</p><a className="link" href={FIGMA} target="_blank" rel="noreferrer">Open the Figma system ↗</a></footer></main>;
}
export function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return <section><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}{children}</section>;
}
export function Card({ title, children }: { title: string; children: ReactNode }) { return <article className="card"><h3>{title}</h3>{children}</article>; }
export function StoryLink({ id, children }: { id: string; children: ReactNode }) { return <a className="link" href={`./?path=/story/${id}`} target="_top">{children} →</a>; }
