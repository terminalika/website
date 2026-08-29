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
│   └── Empty.astro       # renders nothing; used to drop Starlight's theme toggle
└── styles/terminal.css   # the whole look; palette tokens at the top
```

The sidebar is defined in `astro.config.mjs`.

## theming

All colours derive from the `--tk-*` custom properties at the top of
`src/styles/terminal.css`. To add a palette, add a block like the existing
`:root[data-palette='amber']` and set `data-palette` on `<html>`.

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

## deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`. `public/CNAME` pins the custom domain `terminalika.dev`.
