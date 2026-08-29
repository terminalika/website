// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://terminalika.dev',
	integrations: [
		starlight({
			title: 'terminalika',
			description:
				'A tiny terminal game launcher for developers who want something nostalgic to do while their AI agents are working.',
			favicon: '/favicon.svg',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/terminalika/terminalika' },
			],
			customCss: ['./src/styles/terminal.css'],
			components: {
				// Single dark palette: the theme toggle is replaced with nothing.
				ThemeSelect: './src/components/Empty.astro',
			},
			expressiveCode: {
				themes: ['github-dark-default'],
				styleOverrides: {
					borderRadius: '0',
					borderColor: 'var(--tk-border)',
					codeBackground: 'var(--tk-bg-panel)',
					codeFontFamily: 'var(--tk-font-mono)',
					uiFontFamily: 'var(--tk-font-mono)',
					frames: {
						shadowColor: 'transparent',
						terminalTitlebarBackground: 'var(--tk-bg-panel-2)',
						terminalTitlebarBorderBottomColor: 'var(--tk-border)',
						terminalTitlebarDotsForeground: 'var(--tk-accent)',
						terminalTitlebarDotsOpacity: '0.6',
						editorTabBarBackground: 'var(--tk-bg-panel-2)',
						editorActiveTabBackground: 'var(--tk-bg-panel)',
						editorActiveTabIndicatorTopColor: 'var(--tk-accent)',
						editorActiveTabIndicatorBottomColor: 'transparent',
					},
				},
			},
			sidebar: [
				{ label: 'terminalika', slug: '' },
				{ label: 'install', slug: 'install' },
				{
					label: 'usage/',
					items: [
						{ label: 'flags', slug: 'usage/flags' },
						{ label: 'config.json', slug: 'usage/config' },
						{ label: 'keys', slug: 'usage/keys' },
						{ label: 'games', slug: 'usage/games' },
					],
				},
				{
					label: 'agents/',
					items: [
						{ label: 'overview', slug: 'agents' },
						{ label: 'claude-code', slug: 'agents/claude' },
						{ label: 'pi', slug: 'agents/pi' },
					],
				},
				{
					label: 'terminals/',
					items: [
						{ label: 'key-releases', slug: 'terminals' },
						{ label: 'zellij', slug: 'terminals/zellij' },
						{ label: 'tmux', slug: 'terminals/tmux' },
					],
				},
				{ label: 'websocket', slug: 'websocket' },
				{ label: 'development', slug: 'development' },
			],
		}),
	],
});
