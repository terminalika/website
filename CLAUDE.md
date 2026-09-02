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
- Running `terminalika` there does not launch anything: the shell parses the
  line like the binary, then says the launcher needs a real terminal and
  points at `/install`. (The site used to ship a WebAssembly build of the
  games; that was removed - the games only live in the terminal now.) Its
  `GAMES` list still has to match the launcher's, for `--game` validation
  and completions.
- The launcher's warning screens link to `/terminals`, `/terminals/zellij`
  and `/terminals/tmux`; keep those routes stable.

## Changelog

`src/content/docs/changelog.md` is a single running log, newest first.
After any change to `terminalika`, `terminalika-core`, `pi-terminalika` or
this site, add (don't replace) a dated section at the top - reuse today's
date heading if one is already there, rather than adding a second one for
the same day - with one `### <repo>` subsection per repository actually
touched (skip repos with nothing to report). A second change to a repo
already listed under today's date extends that repo's existing bullet list
- append a bullet, don't open a second `### <repo>` under the same date.
Bullets are plain user-facing prose: what changed, not commit messages or
file names. `pi-terminalika` releases get their npm version in the heading
(`pi-terminalika → \`0.1.2\``) - bump it in place if today's section
already names an older version; the others don't version like that, so
just the repo name. Every `### <repo>` heading is a link to that repo's
GitHub page (`github.com/terminalika/<repo>`) - the repo name is the link
text, the version suffix (if any) sits outside the link.
