---
title: events
description: The multi-agent event hub - which agents terminalika listens to, what it reacts to, and how to feed it from any tool with webhooks.
---

Terminalika is an event hub for CLI AI agents: it listens to the agents you
select in setup, tells you the moment one **finishes** or **needs your
input**, and pauses whatever you're playing so you never miss the moment.

Run `terminalika --setup` at any time to change what's selected here.

:::note
This whole page is the CLI's event hub. The [pi extension](/pi/) needs none
of it: it hooks pi's own `agent_settled` event directly - no setup, no
tailing, no webhook, no `terminalika` binary on `PATH`.
:::

## event kinds

Every agent's activity is normalised into two kinds of event:

| Kind             | Meaning                                                                      | In-game overlay                                      |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `finished`       | The agent completed its run and is idle.                                     | `<Agent>'s done - you're up.` (or the agent's `message` from config)         |
| `input_required` | The agent stopped to ask you something: a question, a permission prompt.     | `<Agent> has a question - don't leave it hanging.`                           |

That is the whole delivery: the notice in the game, or the banner, or the
toast on the home screen. terminalika is a game launcher, not a
notification service - it sends no desktop notifications and runs nothing
when no window is open. The in-game notice itself is always on.

An event is shown to you **once**: whichever screen shows it first (the
game's pause notice, the corner banner, the home toast) retires it, so
dismissing it in a game and leaving for the home screen doesn't bring it
back as a toast.

With **auto-pause** on (the default) the running game freezes and shows the
overlay above, centred, in the agent's colour. With it off you keep playing
and the same text appears as a card in the top-right corner for a few
seconds instead. On the home screen the event appears as a top-right toast
either way.

## agents

| Agent       | id       | Native detection                                                                        | Also via webhook |
| ----------- | -------- | --------------------------------------------------------------------------------------- | ---------------- |
| Claude Code | `claude` | Tails `~/.claude/projects/**/*.jsonl`: end of turn → `finished`; `AskUserQuestion` → `input_required`. | yes: hooks give you *permission prompts* too |
| Pi Agent    | `pi`     | Tails `~/.pi/agent/sessions/**/*.jsonl`: terminal stop reason → `finished`. Or skip all this and play [inside pi](/pi/). | yes              |
| Aider       | `aider`  | Tails `.aider.chat.history.md` in the working directory: a new assistant reply → `finished` (best effort). | recommended: `--notifications-command` |
| Cursor CLI  | `cursor` | none                                                                                    | required: `stop` hook |
| OpenCode    | `opencode` | none - keeps its sessions in a SQLite database, not a taileable file. Or skip all this and play [inside opencode](/opencode/). | required: a plugin |

Native detection needs nothing installed on the agent side. Every selected
agent is monitored **concurrently**, on the home screen and inside a game.

### scoping an agent to one project

By default any session of any instance of the agent counts. Narrow it in
[`config.json`](/usage/config/):

```json
{
  "agents": ["claude", "aider"],
  "claude": {"dir": "/home/me/work/backend"},
  "aider":  {"dir": "/home/me/work/backend"}
}
```

`claude.session` / `pi.session` point at one explicit transcript file;
`aider.history` at an explicit history file.

## webhooks: `terminalika notify`

While terminalika runs with at least one agent selected, it listens on a
local HTTP endpoint and publishes its address to `hub.json` in the config
directory:

```json
{"pid": 4242, "addr": "127.0.0.1:7788", "url": "http://127.0.0.1:7788/events"}
```

Anything can `POST` an event to it:

```sh
curl -X POST http://127.0.0.1:7788/events \
  -d '{"agent":"cursor","kind":"input_required","detail":"needs approval for rm -rf"}'

# or with query parameters
curl -X POST 'http://127.0.0.1:7788/events?agent=aider&kind=finished'
```

`agent` is an id from the table above (any other name is accepted and shown
as-is); `kind` accepts the spellings `finished`/`settled`/`done`/`stop` and
`input_required`/`prompt`/`question`/`question_asked`/`permission_prompt`;
`detail` is optional free text for the notification.

The `terminalika notify` subcommand does the lookup and the POST for you,
never touches the terminal, and exits `0` even when no terminalika is
running (so a hook can never break the agent):

```sh
terminalika notify --agent aider --kind finished
terminalika notify --agent cursor --kind input_required --detail "waiting for approval"
```

When a hook pipes its JSON to stdin (Claude Code and Cursor both do), the
kind is **inferred** from `hook_event_name` / `notification_type`, so
`--kind` can be left out.

### Claude Code hooks

Native detection already catches the end of a turn and `AskUserQuestion`.
Hooks add **permission prompts** (tool approvals). In
`~/.claude/settings.json`:

```json
{
  "hooks": {
    "Notification": [{"hooks": [{"type": "command", "command": "terminalika notify --agent claude"}]}],
    "Stop":         [{"hooks": [{"type": "command", "command": "terminalika notify --agent claude"}]}]
  }
}
```

`Notification` with `permission_prompt` / `idle_prompt` becomes
`input_required`; `Stop` becomes `finished`. When both the transcript tail
and the hook report the same thing, the hub keeps one (events of the same
kind from the same agent within 3 s are merged).

### Cursor CLI hooks

In `~/.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "stop": [{"command": "terminalika notify --agent cursor"}]
  }
}
```

### Aider

Aider can run a command whenever it's waiting for you:

```sh
aider --notifications --notifications-command "terminalika notify --agent aider"
```

(or `notifications-command: terminalika notify --agent aider` in
`.aider.conf.yml`).

### OpenCode plugin

OpenCode has no hook config file - a plugin's `event` handler does the
same job. In `opencode.json` (or a project's `.opencode/opencode.json`):

```json
{"plugin": ["./notify-terminalika.ts"]}
```

```ts title="notify-terminalika.ts"
export const NotifyTerminalika = async ({ $ }: { $: Bun.Shell }) => ({
  event: async ({ event }: { event: { type: string } }) => {
    if (event.type === "session.idle") {
      await $`terminalika notify --agent opencode`;
    }
  },
});
```

Playing [inside opencode](/opencode/) instead needs none of this - the
extension hears `session.idle` directly.

### disabling the endpoint

```json
{"webhook": {"disabled": true}}
```

`webhook.addr` changes the base address (default `127.0.0.1:7788`; a taken
port is skipped forward, like the [WebSocket sidecar](/websocket/)).

## one window at a time

Only **one terminalika window** is open at a time, so there is exactly one
place an event shows up. Opening a second window takes over: the first one
closes itself within a couple of seconds, and the new one tells you it did.
Under the hood the window holds the *listener seat* (`listener.json`, with a
heartbeat so a crashed holder is reclaimed automatically) and republishes
`hub.json`, so `terminalika notify` always reaches the window that is
actually reacting.

Nothing runs when no window is open. Earlier versions offered a
background `terminalika daemon` with a login entry; a window removes that
entry on start, and `terminalika daemon` itself now only removes it and
exits.
