package main

import (
	"time"
	"unicode"

	core "github.com/terminalika/terminalika-core"

	"github.com/gdamore/tcell/v2"
)

// releaseMod marks a key event as a key *release*. The glue script relays
// the browser's keyup events through tcell's onKeyEvent with the "meta"
// argument set, which tcell's web screen turns into ModMeta; nothing else in
// the games uses that modifier, so it is free to carry this meaning.
const releaseMod = tcell.ModMeta

const (
	// framePeriod paces update + draw, as in the launcher.
	framePeriod = 8 * time.Millisecond
	// holdTimeout is the watchdog for a key whose keyup never arrives (the
	// tab lost focus mid-hold, for instance); the browser normally reports
	// every release, so this is only a safety net.
	holdTimeout = 1500 * time.Millisecond
)

// keyStateHandler mirrors core.KeyStateHandler structurally, so this builds
// against core versions from before that interface was published as well
// (games that lack it simply never receive releases).
type keyStateHandler interface {
	HandleKeyState(ev *tcell.EventKey, pressed bool) bool
}

func isRelease(ev *tcell.EventKey) bool { return ev.Modifiers()&releaseMod != 0 }

func unmark(ev *tcell.EventKey) *tcell.EventKey {
	return tcell.NewEventKey(ev.Key(), ev.Rune(), ev.Modifiers()&^releaseMod)
}

// engine is a trimmed port of the launcher's internal/engine: the game loop,
// the global keys (ESC menu, R reset, SPACE pause) and press/release
// tracking for games implementing core.KeyStateHandler. External commands
// and the event bus are left out; the browser has no sidecar.
type engine struct {
	screen tcell.Screen
	game   core.Game
	paused bool
	quit   bool
	held   map[keyID]heldKey
}

type keyID struct {
	key tcell.Key
	r   rune
}

type heldKey struct {
	ev   *tcell.EventKey
	last time.Time
}

func newEngine(screen tcell.Screen, game core.Game) *engine {
	return &engine{screen: screen, game: game, held: make(map[keyID]heldKey)}
}

func (e *engine) run() {
	if err := e.game.Init(e.screen); err != nil {
		return
	}
	e.paused = false
	e.quit = false

	ticker := time.NewTicker(framePeriod)
	defer ticker.Stop()

	for !e.quit {
		e.handleEvents()
		e.expireHeld()
		if e.quit {
			break
		}
		e.game.Update()
		e.game.Draw(e.screen)
		<-ticker.C
	}
}

func (e *engine) handleEvents() {
	for e.screen.HasPendingEvent() {
		ev := e.screen.PollEvent()
		if ev == nil {
			continue
		}
		switch ev := ev.(type) {
		case *tcell.EventResize:
			e.screen.Sync()
		case *tcell.EventKey:
			e.handleKey(ev)
		}
	}
}

func (e *engine) handleKey(ev *tcell.EventKey) {
	if isRelease(ev) {
		unmarked := unmark(ev)
		if ks, ok := e.game.(keyStateHandler); ok {
			ks.HandleKeyState(unmarked, false)
		}
		delete(e.held, idOf(unmarked))
		return
	}

	if ev.Key() == tcell.KeyEscape {
		e.quit = true
		return
	}
	if ev.Key() == tcell.KeyRune {
		switch ev.Rune() {
		case 'r', 'R':
			e.paused = false
			e.game.Reset()
			return
		case ' ':
			e.togglePause()
			return
		}
	}

	if ks, ok := e.game.(keyStateHandler); ok && ks.HandleKeyState(ev, true) {
		e.held[idOf(ev)] = heldKey{ev: ev, last: time.Now()}
		return
	}
	e.game.HandleInput(ev)
}

func (e *engine) expireHeld() {
	if len(e.held) == 0 {
		return
	}
	ks, ok := e.game.(keyStateHandler)
	now := time.Now()
	for id, h := range e.held {
		if now.Sub(h.last) < holdTimeout {
			continue
		}
		delete(e.held, id)
		if ok {
			ks.HandleKeyState(h.ev, false)
		}
	}
}

func (e *engine) togglePause() {
	if ps, ok := e.game.(core.PauseState); ok {
		if ps.IsPaused() {
			e.game.Resume()
		} else {
			e.game.Pause()
		}
		return
	}
	if e.paused {
		e.paused = false
		e.game.Resume()
		return
	}
	e.paused = true
	e.game.Pause()
}

func idOf(ev *tcell.EventKey) keyID {
	if ev.Key() == tcell.KeyRune {
		return keyID{key: tcell.KeyRune, r: unicode.ToLower(ev.Rune())}
	}
	return keyID{key: ev.Key()}
}
