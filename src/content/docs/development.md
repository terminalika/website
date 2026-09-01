---
title: development
description: Repository layout, building from source and releasing.
---

## repositories

Terminalika is split across the `terminalika` GitHub organisation:

| Repository                                                        | What                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| [`terminalika/terminalika-core`](https://github.com/terminalika/terminalika-core) | Library: the `Game` contract, registry, event bus, built-in games, high scores. Headless; renders into whatever `tcell.Screen` it is given. |
| [`terminalika/terminalika`](https://github.com/terminalika/terminalika)           | The CLI launcher: menu, engine, key-release handling, agent watchers, WebSocket sidecar, packaging. |
| [`terminalika/pi-terminalika`](https://github.com/terminalika/pi-terminalika)     | The [pi extension](/pi/): the games compiled to wasm, run on a worker thread inside pi, driven by a trimmed TypeScript port of the launcher's engine. |
| [`terminalika/homebrew-tap`](https://github.com/terminalika/homebrew-tap)         | Homebrew cask, pushed by the release pipeline.              |
| [`terminalika/scoop-bucket`](https://github.com/terminalika/scoop-bucket)         | Scoop manifest, pushed by the release pipeline.             |
| [`terminalika/website`](https://github.com/terminalika/website)                   | This site.                                                  |

## build from source

```sh
go install github.com/terminalika/terminalika@latest   # Go 1.24+
```

To hack on the launcher and the library at the same time, clone them side by
side and use a Go workspace so the launcher picks up the local core:

```sh
mkdir terminalika-dev && cd terminalika-dev
git clone git@github.com:terminalika/terminalika-core.git
git clone git@github.com:terminalika/terminalika.git
go work init ./terminalika ./terminalika-core

cd terminalika && go run . --game=snake
```

`go.work` is local-only; don't commit it.

## test

```sh
cd terminalika-core && go test ./...
cd terminalika      && go test ./...
```

The pi extension follows the same sibling-checkout pattern with its own
scripts: `npm run build:wasm` recompiles `wasm/terminalika.wasm` from the
local core (the built wasm is committed, so users never need Go), and
`npm run test:wasm` boots it headlessly. It releases to npm as
[`pi-terminalika`](https://www.npmjs.com/package/pi-terminalika), which
`pi install npm:pi-terminalika` resolves.

## the game contract

Every game implements `core.Game`:

```go
type Game interface {
    Init(screen tcell.Screen)
    Update(now time.Time)
    Draw(screen tcell.Screen)
    HandleInput(ev *tcell.EventKey) bool
    Pause()
    Resume()
    Reset()
}
```

Optional extras:

- `core.KeyStateHandler`: receive key **release** notifications for held
  keys (no built-in game uses it at the moment; see [terminals](/terminals/)).
- `core.Commandable`: accept external commands from the
  [WebSocket sidecar](/websocket/). Every command is acknowledged by a domain
  event correlated by id.

Games publish domain events through an `Emitter`; the launcher forwards them
to connected WebSocket clients.

## releasing

Core is released first whenever its API changes, then the launcher is
pointed at the new core version and tagged. Pushing a `vX.Y.Z` tag on the
launcher runs goreleaser, which builds static binaries for
Linux/macOS/Windows × amd64/arm64, attaches `.deb`, `.rpm`, `.apk` and Arch
packages to the GitHub release, and pushes the Homebrew cask and Scoop
manifest. The full checklist lives in the launcher's
[`RELEASING.md`](https://github.com/terminalika/terminalika/blob/main/RELEASING.md).

## this website

```sh
git clone git@github.com:terminalika/website.git && cd website
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

Built with [Astro Starlight](https://starlight.astro.build). The terminal
look is a single stylesheet, `src/styles/terminal.css`; every colour comes
from the `--tk-*` tokens at the top of that file, so a new palette is one
block of overrides (there is an amber example at the bottom). The animated
shell blocks are `src/components/Shell.astro`.
