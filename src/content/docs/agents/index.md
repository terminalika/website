---
title: agents
description: Pause the game automatically when your coding agent stops and waits for you.
---

The point of terminalika is to have something to do while an AI coding agent
grinds through a task, **without** missing the moment it finishes and waits
for your answer. So the launcher can subscribe to an agent's session and
pause the game the instant the agent settles.

Supported agents (pick any combination in the setup wizard, or with
`--agents`):

| Agent                                  | id       | Detection                          | Page                          |
| -------------------------------------- | -------- | ---------------------------------- | ----------------------------- |
| Claude Code                            | `claude` | session transcripts (+ hooks)      | [agents/claude](/agents/claude/) |
| Pi Agent                               | `pi`     | session files                      | [agents/pi](/agents/pi/)      |
| Aider                                  | `aider`  | chat history (+ notifications command) | [events](/events/#aider)  |
| Cursor CLI                             | `cursor` | `stop` hook → `terminalika notify` | [events](/events/#cursor-cli-hooks) |

All selected agents are monitored at the same time. The full event model -
the two event kinds, notification channels, auto-pause, and the webhook any
tool can post to - is on the [events](/events/) page.

## how it works

No bridge process, no server mode, no plugin on the agent side. Each agent
writes its conversation to a session file on disk as it goes; terminalika
**tails** that file and looks for one specific thing: a new assistant
message whose stop reason means *"I'm done, your turn"*. Messages that are
still calling tools are ignored, and history that existed before the game
started is skipped.

When that message appears the launcher sends the running game a
`<game>.pause` command with a reason, so the overlay reads
`Paused: Claude's done, you're up.` or `Paused: PI's done, you're up.`
(customizable via each agent's `message` config field). Press `SPACE` to
resume when you come back.

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

## one window at a time

Only one terminalika window is open at a time, whichever agents it watches:
a single agent finishing should pause a single screen. Opening a second
window takes over - the first closes itself within a couple of seconds and
the new one shows a short notice saying so. Nothing runs between windows:
terminalika is a game launcher, not a notification service. Details:
[one window at a time](/events/#one-window-at-a-time).
