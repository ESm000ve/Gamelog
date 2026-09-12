import type { Meta, StoryObj } from '@storybook/react-vite';
import { Doc, Section, Card, StoryLink, FIGMA } from './storybook/Docs';
import { StatusChip, STATUS_COLORS } from './components/ui/StatusChip';
import { StarRating } from './components/ui/StarRating';

function WelcomePage() {
 return <Doc eyebrow="Start here" title="A system for the way we play." intro="The working design language behind Gamelog: a personal game library designed and built from scratch.">
  <Section title="Explore the decisions. Try the details."><div className="row"><StoryLink id="foundations-tokens--colors">Explore foundations</StoryLink><StoryLink id="patterns-library--browse">Try the library</StoryLink><a className="link primary" href={FIGMA} target="_blank" rel="noreferrer">View Figma ↗</a></div></Section>
  <Section title="One connected language"><div className="demo row"><StatusChip label="Playing" dotColor={STATUS_COLORS.Playing} active count={4} onClick={() => {}} /><StatusChip label="Backlog" dotColor={STATUS_COLORS.Backlog} active={false} count={16} onClick={() => {}} /><StarRating rating={4.5} size={24} /></div></Section>
  <Section title="Design thinking you can inspect"><div className="grid"><Card title="A quiet canvas"><p>Compact desktop density keeps the collection in focus. Semantic surfaces and a single action accent create hierarchy.</p></Card><Card title="Meaning before decoration"><p>Play status, completion and personal ratings answer different questions. The system preserves those distinctions.</p></Card><Card title="Real implementation"><p>These examples render the app’s React components. Change a theme, use a keyboard, or inspect a control to see the actual behavior.</p></Card></div></Section>
  <Section title="A route through the work"><ol><li><strong>Foundations:</strong> see how the same tokens respond to light, dark and eight accent choices.</li><li><strong>Components:</strong> inspect properties, edge cases and interaction states.</li><li><strong>Patterns:</strong> filter a collection and record a rating using composed components.</li><li><strong>Decisions:</strong> review source references, tradeoffs and open gaps.</li></ol></Section>
  <Section title="How to review"><p>Use the Theme and Accent toolbar controls. In component stories, open Controls to change the props and Accessibility to run checks. Sample data belongs to this demonstration; pattern examples are compositions, not screenshots of complete app screens.</p><p className="note">This is a retrospective systemization of a solo-built product. Impact and adoption claims require evidence; known implementation gaps are documented rather than hidden.</p></Section>
 </Doc>;
}
const meta = { title: 'Welcome', component: WelcomePage, parameters: { layout: 'fullscreen', controls: { disable: true } } } satisfies Meta<typeof WelcomePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Introduction: Story = {};
