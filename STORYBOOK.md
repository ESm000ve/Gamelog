# Gamelog design system

A portfolio companion built from Gamelog's actual React components and CSS tokens.

## Published Storybook

[Open Gamelog's design system](https://esm000ve.github.io/Gamelog/?path=/story/welcome--introduction).

GitHub Pages hosts the static site independently of your computer. Updates pushed to `main` rebuild and deploy it through `.github/workflows/deploy-storybook.yml`. You can also run that workflow manually from GitHub Actions. The address remains stable while this repository and its Pages hosting remain enabled.

## Run locally

Use the Node version supported by the installed Vite and Storybook packages (Node 22.12+ recommended).

```sh
npm ci
npm run storybook
```

Open http://localhost:6006. Start with **Welcome → Introduction**.

```sh
# Check stories and their component dependencies
npx tsc -p tsconfig.storybook.json --noEmit --incremental false
# Build the static site for the existing /Gamelog/ hosting path
npm run build-storybook
# Build for a root-domain host instead
STORYBOOK_BASE_PATH=/ npm run build-storybook
```

Static output is `storybook-static/`. The GitHub Actions workflow uploads and publishes this directory.

## Suggested interview walkthrough

1. **Welcome** — the product context and system structure.
2. **Foundations / Tokens** — source-derived color, type, spacing, radius and elevation. Switch light/dark and accent in the toolbar.
3. **UI and Components** — real implementation variants, states and usage notes.
4. **Patterns / Library** — filter a collection, recover from an empty state and save a rating.
5. **Decisions / System stewardship** — design rationale, known gaps and change process.

[Figma counterpart](https://www.figma.com/design/Zhe33CP0LN0ubMcnn9xp8W?node-id=13-2)

## Demo isolation

Storybook has a separate Vite configuration to avoid starting the Electron app or app services. Only inside Storybook, imports of TagsRepo resolve to `.storybook/tags.fixture.ts`, an in-memory fixture. Tag creation and library actions do not write to the app database. Sample artwork uses deterministic placeholders. Production components are imported directly, not recreated.

## Verification and boundaries

- Static build and focused Storybook TypeScript check pass.
- Browser interaction checks cover empty-state recovery, saving a rating, and modal Escape dismissal with focus restoration.
- Existing full-app TypeScript errors remain outside this documentation change.
- Accessibility findings remain visible in the addon and Decisions page; this is not a claim of full WCAG compliance or a completed screen-reader audit.
- This is a first portfolio edition. Research findings, impact metrics and adoption claims require evidence from the designer before inclusion.

To maintain the system, update the source component or token, review its stories in both appearances, update Figma, and record any behavior or naming changes. Keep demo fixtures separate from personal library data.
