// terminalika-play.js — runs the WebAssembly build of terminalika inside a
// <pre> on the page.
//
// The protocol (which globals tcell's Go side calls and registers) is that of
// tcell's webfiles/tcell.js:
//
//   Copyright 2024 The TCell Authors
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use file except in compliance with the License.
//   You may obtain a copy of the license at
//       http://www.apache.org/licenses/LICENSE-2.0
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// The renderer is not: upstream builds a fresh <span> per dirty cell and
// re-appends every row on each show(), which at the launcher's 125 Hz frame
// rate with a game that redraws ~200 cells per frame (Invaders, Dino) means
// thousands of DOM nodes per second and a full reflow per frame — enough to
// hang the tab. Here the grid is a fixed set of <span>s created once per
// resize; drawCell mutates the one cell in place and show() only moves the
// cursor. Nothing is allocated per frame.
//
// Other differences: the terminal element is passed in instead of looked up
// by id, key listeners live on that element (not the document), keyup is
// relayed as a release (meta=true — see wasm/engine.go), the grid size comes
// from the element's box, nothing touches document.title, and the whole
// thing is wrapped in `window.terminalikaPlay(el, args)` returning a Promise
// that resolves when the Go program exits.
//
// Go calls: resize, clearScreen, drawCell, show, showCursor, setCursorStyle,
// beep, setTitle. Go registers: onKeyEvent, onMouseClick, onMouseMove,
// onFocus, onPaste.
(function () {
	const WASM_URL = '/play/terminalika.wasm';
	const BEEP_URL = '/play/beep.wav';

	let term = null; // the <pre> currently rendered into
	let width = 80;
	let height = 24;
	let cells = []; // cells[y][x] -> <span>, persistent
	let cx = -1; // cursor position as requested by Go
	let cy = -1;
	let shownX = -1; // cursor position currently painted
	let shownY = -1;
	let cursorClass = 'cursor-blinking-block';
	let cursorColor = '';
	let beepAudio = null;

	/* ---- renderer ------------------------------------------------------ */

	function build() {
		cells = [];
		if (!term) return;
		const frag = document.createDocumentFragment();
		for (let y = 0; y < height; y++) {
			const row = document.createElement('span');
			const line = new Array(width);
			for (let x = 0; x < width; x++) {
				const c = document.createElement('span');
				c.textContent = ' ';
				row.appendChild(c);
				line[x] = c;
			}
			row.appendChild(document.createTextNode('\n'));
			frag.appendChild(row);
			cells.push(line);
		}
		term.replaceChildren(frag);
		shownX = shownY = -1;
	}

	function resize(w, h) {
		width = w;
		height = h;
		build();
	}

	function resetCell(c) {
		if (c.textContent !== ' ') c.textContent = ' ';
		if (c.getAttribute('style')) c.removeAttribute('style');
		if (c.className) c.className = '';
	}

	function clearScreen(fg, bg) {
		if (term && typeof fg === 'number' && fg >= 0 && !DEFAULT_FG.has(fg)) term.style.color = intToHex(fg);
		if (term && typeof bg === 'number' && bg >= 0 && bg !== DEFAULT_BG) term.style.backgroundColor = intToHex(bg);
		for (const line of cells) for (const c of line) resetCell(c);
		shownX = shownY = -1;
	}

	const UNDERLINES = ['', 'underline', 'double_underline', 'curly_underline', 'dotted_underline', 'dashed_underline'];

	// tcell's web screen has no notion of "default" colour: a cell drawn with
	// StyleDefault arrives as black-on-#e5e5e5. Treat those (and plain white
	// text) as "inherit from the page" so the canvas is transparent and the
	// text follows the site theme — a real terminal's default colours behave
	// the same way. Games that deliberately paint black backgrounds lose that
	// (none of ours do).
	const DEFAULT_BG = 0x000000;
	const DEFAULT_FG = new Set([0xe5e5e5, 0xffffff]);

	function drawCell(x, y, s, fg, bg, attrs, us, uc) {
		const c = cells[y] && cells[y][x];
		if (!c) return;

		if ((attrs & (1 << 2)) !== 0) {
			// reverse video
			const t = bg;
			bg = fg;
			fg = t;
		}

		if (c.textContent !== s) c.textContent = s;

		const color = fg !== -1 && !DEFAULT_FG.has(fg) ? intToHex(fg) : '';
		const back = bg !== -1 && bg !== DEFAULT_BG ? intToHex(bg) : '';
		if (c.style.color !== color) c.style.color = color;
		if (c.style.backgroundColor !== back) c.style.backgroundColor = back;
		const deco = us !== 0 && uc !== -1 ? intToHex(uc) : '';
		if (c.style.textDecorationColor !== deco) c.style.textDecorationColor = deco;

		let cls = '';
		if (attrs & 1) cls += ' bold';
		if (attrs & (1 << 1)) cls += ' blink';
		if (attrs & (1 << 4)) cls += ' dim';
		if (attrs & (1 << 5)) cls += ' italic';
		if (attrs & (1 << 6)) cls += ' strikethrough';
		if (us !== 0) cls += ' ' + (UNDERLINES[us] || 'underline');
		if (shownX === x && shownY === y) cls += ' ' + cursorClass;
		cls = cls.trim();
		if (c.className !== cls) c.className = cls;
	}

	function show() {
		if (shownX === cx && shownY === cy) return;
		const old = cells[shownY] && cells[shownY][shownX];
		if (old) old.classList.remove(cursorClass);
		shownX = cx;
		shownY = cy;
		const cur = cells[cy] && cells[cy][cx];
		if (cur) {
			term.style.setProperty('--cursor-color', cursorColor || 'lightgrey');
			cur.classList.add(cursorClass);
		}
	}

	function showCursor(x, y) {
		cx = x;
		cy = y;
	}

	function setCursorStyle(newClass, newColor) {
		if (newClass === cursorClass && newColor === cursorColor) return;
		const cur = cells[shownY] && cells[shownY][shownX];
		if (cur) cur.classList.remove(cursorClass);
		shownX = shownY = -1; // repaint with the new class on next show()
		cursorClass = newClass;
		cursorColor = newColor;
	}

	function beep() {
		try {
			beepAudio = beepAudio || new Audio(BEEP_URL);
			beepAudio.currentTime = 0;
			void beepAudio.play();
		} catch {
			/* autoplay policies; ignore */
		}
	}

	function setTitle() {
		/* the page keeps its own title */
	}

	const hexCache = new Map();
	function intToHex(n) {
		let s = hexCache.get(n);
		if (!s) {
			s = '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
			hexCache.set(n, s);
		}
		return s;
	}

	Object.assign(window, { resize, clearScreen, drawCell, show, showCursor, setCursorStyle, beep, setTitle });

	// No-op receivers until Go registers the real ones.
	for (const name of ['onKeyEvent', 'onMouseClick', 'onMouseMove', 'onFocus', 'onPaste']) {
		if (typeof window[name] !== 'function') window[name] = () => {};
	}

	/* ---- host -------------------------------------------------------------- */

	/** Measure the cell grid that fits `el` (rows are fixed by its height). */
	function measure(el) {
		const probe = document.createElement('span');
		probe.textContent = 'M'.repeat(20);
		probe.style.visibility = 'hidden';
		probe.style.position = 'absolute';
		el.appendChild(probe);
		const cw = probe.getBoundingClientRect().width / 20;
		const lh = parseFloat(getComputedStyle(el).lineHeight) || probe.getBoundingClientRect().height;
		probe.remove();
		const cols = Math.max(40, Math.min(160, Math.floor(el.clientWidth / cw)));
		const rows = Math.max(12, Math.floor(el.clientHeight / lh));
		return { cols, rows };
	}

	const IGNORED_KEYS = new Set(['Control', 'Alt', 'Meta', 'Shift', 'CapsLock', 'NumLock', 'ScrollLock', 'Dead', 'Unidentified']);

	/**
	 * wasm_exec.js leaves timers it scheduled for the Go runtime pending after
	 * the program exits; when one fires it throws "Go program has already
	 * exited". Clear them so an exit is silent.
	 */
	function settle(go) {
		if (!go) return;
		try {
			if (go._scheduledTimeouts instanceof Map) {
				for (const id of go._scheduledTimeouts.values()) clearTimeout(id);
				go._scheduledTimeouts.clear();
			}
			go._resume = () => {};
		} catch {
			/* private fields moved; nothing to do */
		}
	}

	let modulePromise = null;
	function compiled() {
		if (!modulePromise) {
			modulePromise = WebAssembly.compileStreaming(fetch(WASM_URL)).catch((err) => {
				modulePromise = null;
				throw err;
			});
		}
		return modulePromise;
	}

	/**
	 * Run terminalika inside `el` with the given argv (e.g. ['--game=snake']).
	 * Resolves when the program exits (ESC on the menu). Only one instance
	 * runs at a time; a second call while one is running rejects.
	 */
	let running = false;
	window.terminalikaPlay = async function (el, args = []) {
		if (running) throw new Error('terminalika is already running');
		if (typeof Go !== 'function') throw new Error('wasm_exec.js is not loaded');
		running = true;

		term = el;
		term.replaceChildren();
		term.tabIndex = 0;
		const { cols, rows } = measure(el);
		window.tkTermSize = { cols, rows };
		cx = cy = -1;
		resize(cols, rows);

		const onKeyDown = (e) => {
			if (IGNORED_KEYS.has(e.key)) return;
			// Plain keys belong to the game; leave browser chords (Ctrl/Cmd+…) alone.
			if (!e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
			window.onKeyEvent(e.key, e.shiftKey, e.altKey, e.ctrlKey, false);
		};
		const onKeyUp = (e) => {
			if (IGNORED_KEYS.has(e.key)) return;
			if (!e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
			// meta=true marks a release; the Go engine strips it again.
			window.onKeyEvent(e.key, e.shiftKey, e.altKey, e.ctrlKey, true);
		};
		const onBlur = () => window.onFocus(false);
		const onFocusIn = () => window.onFocus(true);
		el.addEventListener('keydown', onKeyDown);
		el.addEventListener('keyup', onKeyUp);
		el.addEventListener('blur', onBlur);
		el.addEventListener('focus', onFocusIn);
		el.focus({ preventScroll: true });

		let go = null;
		try {
			go = new Go();
			go.argv = ['terminalika', ...args];
			const instance = await WebAssembly.instantiate(await compiled(), go.importObject);
			await go.run(instance);
		} finally {
			settle(go);
			el.removeEventListener('keydown', onKeyDown);
			el.removeEventListener('keyup', onKeyUp);
			el.removeEventListener('blur', onBlur);
			el.removeEventListener('focus', onFocusIn);
			for (const name of ['onKeyEvent', 'onMouseClick', 'onMouseMove', 'onFocus', 'onPaste']) window[name] = () => {};
			term = null;
			cells = [];
			running = false;
		}
	};
})();
