---
title: claude-code
description: Pause the game when Claude Code finishes a turn.
---

Terminalika tails Claude Code's own session transcripts and pauses the game
when the agent stops and waits for you. Nothing to install on the Claude Code
side.

## enable

```sh
# for one run
terminalika --game=snake --claude

# permanently
cat > ~/.config/terminalika/config.json <<'EOF'
{"claude": {"subscribe": true}}
EOF
terminalika --game=snake
```

The flag and the config field are OR-ed; either is enough.

## config

```jsonc
{
  "claude": {
    "subscribe": true,
    "dir": "/home/me/my-project",   // optional: only this project's Claude Code
    "session": "",                  // optional: an explicit transcript file, overrides "dir"
    "message": ""                   // optional: custom pause text, after the fixed "Paused: " prefix
  }
}
```

| Field       | Meaning                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| `subscribe` | Enable the watcher.                                                                      |
| `dir`       | Restrict to sessions of the Claude Code instance whose working directory is this path. Unset = every project. |
| `session`   | Watch exactly this session file. Wins over `dir`.                                        |
| `message`   | Pause overlay text shown after the fixed `Paused: ` prefix. Defaults to `Claude's done, you're up.`. |

## where sessions are read from

Claude Code's own layout: `~/.claude/projects` by default, or
`<dir>/projects` when `CLAUDE_CONFIG_DIR` is set. A session's own subagent
transcripts are never watched directly.

## what triggers the pause

A new **assistant** message with a terminal `stop_reason` (for example
`end_turn`). Messages whose `stop_reason` is `tool_use` (the agent is still
working) are ignored, and only entries appended *after* the game started
count.

The game receives:

```json
{"kind":"command", "type":"snake.pause", "payload":{"reason":"Paused: Claude's done, you're up."}}
```

so the pause overlay reads **Paused: Claude's done, you're up.** (or your
custom `message`). `SPACE` resumes.

## troubleshooting

- *It never pauses.* Check that `~/.claude/projects` (or `$CLAUDE_CONFIG_DIR/projects`)
  exists and that the transcript for the running session is being written
  there. With `dir` set, the path must match the agent's working directory
  exactly.
- *It paused in the wrong window.* Only one window listens at a time; see
  [one listener at a time](/agents/#one-window-at-a-time).
