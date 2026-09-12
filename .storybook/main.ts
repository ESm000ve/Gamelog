import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
const config: StorybookConfig = {
 stories: ['../src/**/*.stories.@(ts|tsx)'],
 addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
 framework: { name: '@storybook/react-vite', options: { builder: { viteConfigPath: fileURLToPath(new URL('./vite.config.ts', import.meta.url)) } } },
 viteFinal: async (config) => {
  config.base = process.env.STORYBOOK_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/Gamelog/' : '/');
  config.cacheDir = fileURLToPath(new URL('../.storybook-cache/vite', import.meta.url));
  config.plugins = [...(config.plugins ?? []), { name: 'gamelog-demo-tags', enforce: 'pre', resolveId(id) { if (/(?:^|\/)TagsRepo(?:\.ts)?$/.test(id)) return fileURLToPath(new URL('./tags.fixture.ts', import.meta.url)); } }];
  return config;
 },
};
export default config;
