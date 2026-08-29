# terminalika.dev

Documentation site for [terminalika](https://github.com/terminalika/terminalika),
built with [Astro Starlight](https://starlight.astro.build) and styled to look
like the thing it documents.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve dist/
```

## layout

```
src/
├── content/docs/         # pages (Markdown / MDX); the URL is the file path
│   ├── index.mdx         # /
│   ├── install.mdx       # /install
│   ├── usage/            # /usage/flags, /usage/config, /usage/keys, /usage/games
│   ├── agents/           # /agents, /agents/claude, /agents/pi
│   ├── terminals/        # /terminals, /terminals/zellij, /terminals/tmux
│   ├── websocket.md
│   └── development.md
├── components/
│   ├── Shell.astro       # animated fake terminal (<Shell lines={[...]} />)
│   ├── Terminal.astro    # interactive shell on the home page; only `terminalika` exists,
│   │                     # and it runs the real games (WebAssembly, see wasm/)
│   └── Empty.astro       # renders nothing; used to drop Starlight's theme toggle
└── styles/terminal.css   # the whole look; palette tokens at the top
```

The sidebar is defined in `astro.config.mjs`.

## theming

All colours derive from the `--tk-*` custom properties at the top of
`src/styles/terminal.css`, defined once for dark and once for light
(`data-theme` on `<html>`, flipped by `src/components/ThemeToggle.astro`).
Rule: every token exists in both modes and no raw colour appears anywhere
else; `npm run check:theme` (run automatically before `build`) enforces it.
See `CLAUDE.md`. To add a palette, copy the `data-palette='amber'` blocks
(dark + light) and set `data-palette` on `<html>`.

Fonts (self-hosted via Fontsource): JetBrains Mono for everything,
Pixelify Sans (pixel) for the logo (semibold, lowercase) and headings (regular).

## shell blocks

```mdx
import Shell from '../../components/Shell.astro';

<Shell title="~/project" lines={[
  { type: 'comment', text: '# a comment line' },
  { type: 'input',   text: 'terminalika --game=snake' },
  { type: 'output',  text: 'plain output' },
  { type: 'ok',      text: 'green line' },
  { type: 'warn',    text: 'yellow line' },
  { type: 'error',   text: 'red line', delay: 300 },
]} />
```

Input lines are typed character by character when the block scrolls into
view; `autoplay={false}` shows it static with a replay button.

## playable games (WebAssembly)

`wasm/` is a tiny Go module: the published `terminalika-core` games, tcell's
WebAssembly screen and a trimmed port of the launcher's menu + engine.

```sh
npm run build:wasm   # needs Go 1.24+; writes public/play/terminalika.wasm + wasm_exec.js
npm run test:wasm    # headless smoke test: boots the wasm, presses ESC, expects a clean exit
```

The built `.wasm` is committed on purpose: the site doesn't need to track
every core release. Bump the pin in `wasm/go.mod` and rebuild when you want
newer games. `public/play/terminalika-play.js` is the DOM renderer/glue
(derived from tcell's `webfiles/tcell.js`, Apache-2.0).

## deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`. `public/CNAME` pins the custom domain `terminalika.dev`.
