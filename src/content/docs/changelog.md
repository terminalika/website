---
title: changelog
description: What shipped, by repository — newest first.
---

Every update across the terminalika repositories, newest first, grouped by
repository. See [development](/development/) for what each repository is.

## 2026-09-04

### [opencode-play](https://github.com/terminalika/opencode-play)

- The README now leads with a demo gif, matching pi-play's.

### [website](https://github.com/terminalika/website)

- The home demo carousel gained a third slide: opencode-play, alongside
  the CLI and the pi plugin, tagged "opencode-plugin" in a new blue drawn
  just for it - opencode's own brand is grayscale, so its tag borrows the
  hue instead of reusing it. Re-recorded with a cleaner take since.
- Each slide now holds on its first frame while its tag flashes over it,
  instead of playing right away - the game's own motion no longer
  competes with the tag for attention. It starts once the tag has faded.

## 2026-09-03

### [terminalika-core](https://github.com/terminalika/terminalika-core) → `v0.7.1`

- Games no longer paint their own PAUSED/GAME OVER text over the board -
  the launcher's own notice, already shown in the agent's color, is the
  only thing shown for a pause or game over now.

### [terminalika](https://github.com/terminalika/terminalika) → `v0.6.3`

- Fixed the pause/agent notice flickering between its color and the board
  underneath it: the frame is now drawn once and shown once, instead of
  the game, the notice and the banner each flushing the screen on their
  own.

### [terminalika](https://github.com/terminalika/terminalika) → `v0.6.4`

- The home screen's hero art slides into place noticeably faster now - a
  snappier landing instead of the previous, slower ease.

### [opencode-play](https://github.com/terminalika/opencode-play) → `v0.1.1`

- A running game now pauses (or parks/settles, per your setting) the
  moment opencode needs you for a permission or a question, not just once
  the agent's fully done - previously only `session.idle` triggered it.
- A parked game now shows in the footer hint, both on the home screen and
  next to the prompt once a session's started, so it's never forgotten
  off-screen.
- The auto-pause preference is now asked right when the plugin loads,
  instead of waiting for your first `/play`. Dismissing the dialog
  without picking defaults to pausing - the option is now labeled
  "(default)".

### [website](https://github.com/terminalika/website)

- Updated both home page demo videos.
- The demo carousel now auto-advances: when a video ends it moves to the
  other one, wrapping back to the first, instead of looping forever on
  its own. A tag flashes over each video for its first second or so -
  "standalone" in terminalika's own green, "pi-plugin" in pi's purple.

## 2026-09-02

### [terminalika](https://github.com/terminalika/terminalika) → `v0.6.2`

- Setup now asks up front how you want to use terminalika: watch AI
  agents (the existing flow), or just play - which skips the agent and
  auto-pause questions entirely and saves a plain game-launcher config,
  nothing watched, nothing configured.
- OpenCode joins the agent list. It keeps its sessions in a SQLite
  database, not a file terminalika can tail, so it's hook-only, the same
  shape as Cursor CLI: a small plugin calling `terminalika notify --agent
  opencode` on `session.idle`.

### [terminalika-core](https://github.com/terminalika/terminalika-core) → `v0.7.0`

- A game's hint line now wraps onto more lines instead of hanging off a
  narrow surface; a launcher that sizes itself to the game (like pi's
  overlay) gets the extra rows instead of a clipped hint.
- 2048's empty cells are tinted to read as part of the board, instead of
  floating on the terminal's own background.

### [pi-play](https://github.com/terminalika/pi-play) → `0.1.0`

- Renamed from pi-terminalika: `/play` is the actual command surface, so
  the package now reads as what it does at a glance in pi's own search.
  `pi-play` itself was already taken on npm by an unrelated package, so
  it publishes as the scoped `@terminalika/pi-play` instead - install
  with `pi install npm:@terminalika/pi-play`.
- `pi-terminalika` stays published on npm, deprecated, pointing here.

### [opencode-play](https://github.com/terminalika/opencode-play) → `0.1.0`

- First release: terminalika inside [opencode](https://opencode.ai), the
  pi extension's sibling - the same wasm build of the games, on a
  full-screen TUI route instead of an overlay. `/play`, `/play-menu`,
  `/play-stop`; `alt+g` opens the game menu from either side, the editor
  or mid-game, matching pi-play's own menu; auto-pauses on opencode's
  `session.idle` event.
- Install by adding `"opencode-play"` to your `tui.json`'s `plugin`
  array.

### [website](https://github.com/terminalika/website)

- Reworked the sidebar into two tracks: `pi extension` on its own, and
  every CLI page folded under a new "the cli/" group - previously they
  sat in one flat list. `agents/pi` (the CLI watching pi's session files)
  is now labeled "pi (as an agent)" so it stops reading like the
  unrelated "pi extension" entry above it. No page content or URLs
  changed.
- Added a homepage FAQ entry for the new "just play" setup choice.
- Dropped a redundant homepage FAQ entry; rounded out "where to go next"
  with the research and changelog pages, missing there entirely.
- Each repo heading on this page now links to its GitHub repo.
- Every live `pi-terminalika` reference (install snippets, the repo
  table, the agents comparison) now points at `pi-play`; added
  `opencode-play` to the repo table.
- The opencode extension gets its own page - install, the `/play` table,
  auto-pause modes, held keys, what it doesn't do - matching the pi
  extension's depth. Also in the sidebar, the install page's comparison
  table, and every homepage mention that used to name pi alone.
- The homepage hero: "a pi plugin or an opencode plugin" collapsed into
  "a plugin for pi and opencode" - one clause instead of a growing list.
- Documented the CLI watching OpenCode: the plugin snippet for
  `opencode.json`, and a row in both agent-comparison tables (install,
  agents).

## 2026-09-01

### [pi-terminalika](https://github.com/terminalika/pi-terminalika) → `0.1.2`

- `/play <other>` now swaps the running game instead of refusing — asks
  first (Yes / No / Yes, and don't ask again; remembered in `pi.json`).
- alt+g opens a game menu, from pi or from inside the game: the running
  game leads (so Enter alone resumes it), "Return to pi" right under it,
  then every other game to swap to.
- ESC only parks the game - paused, hidden, pi has the keyboard again - it
  never forces focus back to pi. alt+g's menu is the reliable way to
  return.
- Hints, toasts and the status line say "option" instead of "alt" on a Mac.
- The pause hint reads "pause/resume", not just "pause".
- The status line shows how to start a game (`alt+g` or `/play <game>`)
  when nothing is running.

### [terminalika-core](https://github.com/terminalika/terminalika-core)

- The pause hint's wording - "pause/resume" instead of "pause" - moved
  into the shared library, so every launcher picks it up.

### [website](https://github.com/terminalika/website)

- Added this changelog page.
