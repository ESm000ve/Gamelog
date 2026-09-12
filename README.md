# Gamelog

## Features

- **Beautiful UI:** A meticulously crafted interface featuring glassmorphism, dynamic animations, and a rich dark mode.
- **Privacy First:** All data is stored locally in your browser using IndexedDB. Your data never leaves your device.
- **Rich Library Management:** Organize games by status, platform, release year, and custom lists.
- **Discover:** Search and add games to your library instantly.
- **Activity Logging:** Log your playtime, ratings, and thoughts for every game.

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Vanilla CSS with custom design tokens
- **Database:** Dexie (IndexedDB)
- **Icons:** Lucide React
- **Packaging:** Electron (Optional for Desktop builds)

## Getting Started

**Minimum Requirements:** Node.js version 18 or higher.

### Development

To start the app in development mode, run:

```bash
npm install
npm run dev
```

Alternatively on macOS, you can double-click the `start.command` script in the root of the project to automatically verify your Node version, install dependencies, and launch the dev server.

### Desktop App (Electron)

If you'd like to bundle Gamelog into a standalone `.app` for macOS:

```bash
npm run build:desktop
```
This will compile the app and use `electron-builder` to package it into the `release/` folder.

## Data Storage

Your data is stored locally via IndexedDB. 
- **Safari:** `~/Library/Safari/Databases/` or `~/Library/Containers/com.apple.Safari/Data/Library/WebKit/Databases/`
- **Chrome / Brave:** `~/Library/Application Support/Google/Chrome/Default/IndexedDB/`
- **Firefox:** `~/Library/Application Support/Firefox/Profiles/<profile-folder>/storage/default/`
