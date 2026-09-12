import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({ theme: create({ base: 'dark', brandTitle: 'Gamelog · Design System', brandUrl: '?path=/story/welcome--introduction', brandTarget: '_self', colorPrimary: '#5e5ce6', colorSecondary: '#9b99ff', appBg: '#1e1e1e', appContentBg: '#1e1e1e', appBorderColor: '#38383a', appBorderRadius: 8, fontBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }) });
