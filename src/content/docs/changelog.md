---
title: changelog
description: What shipped, by repository — newest first.
---

Every update across the terminalika repositories, newest first, grouped by
repository. See [development](/development/) for what each repository is.

## 2026-09-02

### website

- Reworked the sidebar into two tracks: `pi extension` on its own, and
  every CLI page folded under a new "the cli/" group - previously they
  sat in one flat list. `agents/pi` (the CLI watching pi's session files)
  is now labeled "pi (as an agent)" so it stops reading like the
  unrelated "pi extension" entry above it. No page content or URLs
  changed.

## 2026-09-01

### pi-terminalika → `0.1.2`

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

### terminalika-core

- The pause hint's wording - "pause/resume" instead of "pause" - moved
  into the shared library, so every launcher picks it up.

### website

- Added this changelog page.
