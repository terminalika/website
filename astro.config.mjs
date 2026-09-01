// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://terminalika.dev',
	// The setup wizard and `terminalika notify --help` print this short URL.
	redirects: {
		'/docs/events': '/events/',
	},
	integrations: [
		starlight({
			title: 'terminalika',
			description:
				'An event-driven focus hub for CLI AI agents: get notified the moment an agent finishes or needs you, with a retro game library for the wait.',
			favicon: '/logo-large-canvas.png',
			logo: { src: './src/assets/logo.svg', alt: '' },
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/terminalika/terminalika' },
			],
			customCss: ['./src/styles/terminal.css'],
			components: {
				// Terminal-style [dark]/[light] toggle instead of the stock <select>.
				ThemeSelect: './src/components/ThemeToggle.astro',
			},
			expressiveCode: {
				// Order matters for Starlight: [dark, light]; picked via data-theme.
				themes: ['github-dark-default', 'github-light-default'],
				// Wrap long lines instead of relying on horizontal scroll: fenced
				// blocks in the docs (websocket payloads, jsonc configs with long
				// trailing comments) have single lines wider than the content
				// column, which otherwise overflow the frame on narrow viewports.
				defaultProps: {
					wrap: true,
				},
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
						inlineButtonBackground: 'var(--tk-bg-panel-2)',
						inlineButtonForeground: 'var(--tk-fg-dim)',
						inlineButtonBorder: 'var(--tk-border)',
						inlineButtonBorderOpacity: '1',
						inlineButtonBackgroundIdleOpacity: '1',
						inlineButtonBackgroundHoverOrFocusOpacity: '1',
					},
				},
			},
			sidebar: [
				{ label: 'terminalika', slug: '' },
				{ label: 'install', slug: 'install' },
				{ label: 'pi extension', slug: 'pi' },
				{ label: 'research', slug: 'research' },
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
				{ label: 'events', slug: 'events' },
				{ label: 'websocket', slug: 'websocket' },
				{ label: 'development', slug: 'development' },
			],
		}),
	],
});
