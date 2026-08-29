---
title: agents
description: Pause the game automatically when your coding agent stops and waits for you.
---

The point of terminalika is to have something to do while an AI coding agent
grinds through a task, **without** missing the moment it finishes and waits
for your answer. So the launcher can subscribe to an agent's session and
pause the game the instant the agent settles.

Supported agents:

| Agent                                  | Flag       | Config block | Page                          |
| -------------------------------------- | ---------- | ------------ | ----------------------------- |
| Claude Code                            | `--claude` | `"claude"`   | [agents/claude](/agents/claude/) |
| pi                                     | `--pi`     | `"pi"`       | [agents/pi](/agents/pi/)      |

Both can be on at the same time; either agent settling pauses the game.

## how it works

No bridge process, no server mode, no plugin on the agent side. Each agent
writes its conversation to a session file on disk as it goes; terminalika
**tails** that file and looks for one specific thing: a new assistant
message whose stop reason means *"I'm done, your turn"*. Messages that are
still calling tools are ignored, and history that existed before the game
started is skipped.

When that message appears the launcher sends the running game a
`<game>.pause` command with a reason, so the overlay reads
`Paused by Claude` or `Paused by PI`. Press `SPACE` to resume when you come
back.

```sh
terminalika --game=snake --claude
```

or permanently, in [`config.json`](/usage/config/):

```json
{"claude": {"subscribe": true}}
```

## scope

By default **any** session of **any** running instance of the agent triggers
the pause. To narrow it, set in the config:

- `dir`: only the agent whose working directory is this path;
- `session`: exactly this session file (overrides `dir`).

## one listener at a time

You can run several terminalika windows, but only **one** may listen for
agent events, regardless of which agent(s) it watches; a single agent
finishing should pause a single screen, not all of them.

- The first instance started with `--claude` / `--pi` (or `subscribe` in the
  config) takes the *listener seat* silently.
- A second one asks:

  ```
  Another terminalika window is currently listening
  for agent events (pi / Claude Code).

  Move event listening to this window instead?
  ```

  Accept to move listening here; decline and this window plays without
  pausing on any agent event.
- An instance started with neither flag never asks and never pauses.

The seat is recorded in `listener.json` in the config directory with a
heartbeat, so a crashed holder is reclaimed automatically instead of asking
forever. If the seat is taken over while you are mid-game, that window stops
reacting to agent events immediately.
