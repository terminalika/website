# terminalika.dev

Docs site for the terminalika launcher. Astro Starlight; content in
`src/content/docs` (URL = file path); sidebar in `astro.config.mjs`.

```sh
npm run dev          # local preview
npm run check:theme  # theme rule below; also runs before every build
npm run build
```

## Theme rule: every colour exists in both dark and light

The site has a dark/light switcher (`src/components/ThemeToggle.astro`,
driven by `data-theme` on `<html>`). To keep both modes complete:

1. **All colour lives in `src/styles/terminal.css`, section 1, as `--tk-*`
   tokens.** Components, MDX and other CSS never contain a raw colour value
   (`#hex`, `rgb()`, `hsl()`, named colours); they use `var(--tk-…)`.
2. **Every token is defined twice**: once in the DARK block
   (`:root, :root[data-theme='dark']`) and once in the LIGHT block
   (`:root[data-theme='light']`), plus the no-JS fallback under
   `@media (prefers-color-scheme: light)`. Adding a token to one block
   without the other two is a build failure.
3. **New palettes** (`[data-palette='name']`) follow the same shape: a dark
   block and a light block with the same token set. See the amber example in
   section 7.
4. Semi-transparent tints get their own token (`--tk-accent-glow`,
   `--tk-warn-low`, …); do not derive them with `rgba(...)` inline.
5. Anything that only makes sense in one mode (e.g. scanline intensity)
   still gets a value in the other mode, even if it is subtle or
   `transparent`.

`scripts/check-theme.mjs` enforces 1–3 mechanically and fails
`npm run build` on violations. Run it after any change to `terminal.css`.

## Typography

- Body, code, UI: `--tk-font-mono` (JetBrains Mono).
- Logo (`.site-title`) and headings (h1–h4, hero, "On this page"):
  `--tk-font-display` (Pixelify Sans, a pixel font). Logo is weight 600
  and always lowercase; headings are weight 400 and keep the casing written
  in the content. Never use it for body text, tables or anything below
  ~1rem; it becomes unreadable.
- Both fonts are self-hosted via Fontsource imports at the top of
  `terminal.css`; do not add Google Fonts `<link>`s.

## Content conventions

- Pages are lowercase, terminal-style (`flags`, `config.json`, `zellij`).
- Shell demos use `<Shell lines={[...]} />` from `src/components/Shell.astro`,
  never screenshots.
- The home page has a real interactive shell (`src/components/Terminal.astro`)
  that only knows `terminalika`. Its `FLAGS` table and error strings mirror
  the Go binary (`main.go` flag definitions, Go `flag` package messages);
  when a flag is added or renamed in the launcher, update it there too.
- Running `terminalika` there launches the **real games**: `wasm/` is a
  small Go module (terminalika-core games, tcell's WebAssembly screen, a
  trimmed port of the launcher's menu/engine). `npm run build:wasm` compiles
  it into `public/play/terminalika.wasm` (committed; ~4 MB, gzips to ~1 MB),
  copies `wasm_exec.js` from GOROOT and records what it was built from in
  `public/play/build-info.txt`. It prefers a sibling `../terminalika-core`
  checkout (through a throwaway go.work) and falls back to the version
  pinned in `wasm/go.mod`; the site does not need to track every core
  release — rebuild when you want newer games. `npm run test:wasm` boots
  the binary headlessly (menu + every game, ESC exits). The engine uses a
  structural `keyStateHandler` interface so it builds against older cores.
  `public/play/terminalika-play.js` is the renderer/glue derived from
  tcell's `webfiles/tcell.js` (Apache-2.0 header kept); browser keyup is
  relayed as a release (meta=true) so held keys feel right.
- Theme-rule exception: the game canvas (`.tk-term__game`) shows whatever
  colours the Go program paints, like a real terminal; those come from the
  wasm, not from CSS, so the rule still holds for the stylesheet.
- The launcher's warning screens link to `/terminals`, `/terminals/zellij`
  and `/terminals/tmux`; keep those routes stable.
