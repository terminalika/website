// terminalika-play.js — runs the WebAssembly build of terminalika inside a
// <pre> on the page.
//
// The renderer half (drawCell/show/…) is derived from tcell's webfiles/tcell.js:
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
// Changes from upstream: the terminal element is passed in instead of looked
// up by id, key listeners live on that element (not the document), keyup is
// relayed as a release (meta=true — see wasm/engine.go), the grid size comes
// from the element's box, nothing touches document.title, and the whole thing
// is wrapped in `window.terminalikaPlay(el, args)` returning a Promise that
// resolves when the Go program exits.
//
// tcell's Go side calls these globals: resize, clearScreen, drawCell, show,
// showCursor, setCursorStyle, beep, setTitle. It registers: onKeyEvent,
// onMouseClick, onMouseMove, onFocus, onPaste.
(function () {
	const WASM_URL = '/play/terminalika.wasm';
	const BEEP_URL = '/play/beep.wav';

	let term = null; // the <pre> currently rendered into
	let width = 80;
	let height = 24;
	let cx = -1;
	let cy = -1;
	let cursorClass = 'cursor-blinking-block';
	let cursorColor = '';
	let content; // {data: row[height], dirty: bool}; row = {data: node[width], previous: span|null}
	let beepAudio = null;

	function resize(w, h) {
		width = w;
		height = h;
		content = { data: new Array(height), dirty: true };
		for (let i = 0; i < height; i++) content.data[i] = { data: new Array(width), previous: null };
		clearScreen();
	}

	function clearScreen(fg, bg) {
		if (term && fg && fg >= 0) term.style.color = intToHex(fg);
		if (term && bg && bg >= 0) term.style.backgroundColor = intToHex(bg);
		content.dirty = true;
		for (let i = 0; i < height; i++) {
			content.data[i].previous = null;
			for (let j = 0; j < width; j++) content.data[i].data[j] = document.createTextNode(' ');
		}
	}

	function drawCell(x, y, s, fg, bg, attrs, us, uc) {
		const span = document.createElement('span');
		let use = false;
		if ((attrs & (1 << 2)) !== 0) {
			const t = bg;
			bg = fg;
			fg = t;
			use = true;
		}
		if (fg !== -1) {
			span.style.color = intToHex(fg);
			use = true;
		}
		if (bg !== -1) {
			span.style.backgroundColor = intToHex(bg);
			use = true;
		}
		if (attrs !== 0) {
			use = true;
			if (attrs & 1) span.classList.add('bold');
			if (attrs & (1 << 4)) span.classList.add('dim');
			if (attrs & (1 << 5)) span.classList.add('italic');
			if (attrs & (1 << 6)) span.classList.add('strikethrough');
		}
		if (us !== 0) {
			use = true;
			span.classList.add(['', 'underline', 'double_underline', 'curly_underline', 'dotted_underline', 'dashed_underline'][us] || 'underline');
			if (uc !== -1) span.style.textDecorationColor = intToHex(uc);
		}
		const text = document.createTextNode(s);
		if ((attrs & (1 << 1)) !== 0) {
			const blink = document.createElement('span');
			blink.classList.add('blink');
			blink.appendChild(text);
			span.appendChild(blink);
		} else span.appendChild(text);

		content.dirty = true;
		content.data[y].previous = null;
		content.data[y].data[x] = use ? span : text;
	}

	function show() {
		if (!content.dirty || !term) return;
		displayCursor();
		term.replaceChildren();
		for (const row of content.data) {
			if (row.previous == null) {
				row.previous = document.createElement('span');
				for (const c of row.data) row.previous.appendChild(c);
				row.previous.appendChild(document.createTextNode('\n'));
			}
			term.appendChild(row.previous);
		}
		content.dirty = false;
	}

	function showCursor(x, y) {
		content.dirty = true;
		if (!(cx < 0 || cy < 0)) {
			content.data[cy].previous = null;
			const c = content.data[cy].data[cx];
			if (c.classList) c.classList.remove(cursorClass);
		}
		cx = x;
		cy = y;
	}

	function displayCursor() {
		content.dirty = true;
		if (cx < 0 || cy < 0) return;
		content.data[cy].previous = null;
		if (!content.data[cy].data[cx].classList) {
			const span = document.createElement('span');
			span.appendChild(content.data[cy].data[cx]);
			content.data[cy].data[cx] = span;
		}
		term.style.setProperty('--cursor-color', cursorColor || 'lightgrey');
		content.data[cy].data[cx].classList.add(cursorClass);
	}

	function setCursorStyle(newClass, newColor) {
		if (newClass === cursorClass && newColor === cursorColor) return;
		if (!(cx < 0 || cy < 0)) {
			content.dirty = true;
			content.data[cy].previous = null;
			const c = content.data[cy].data[cx];
			if (c.classList) c.classList.remove(cursorClass);
		}
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

	function intToHex(n) {
		return '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
	}

	Object.assign(window, { resize, clearScreen, drawCell, show, showCursor, setCursorStyle, beep, setTitle });

	// No-op receivers until Go registers the real ones.
	for (const name of ['onKeyEvent', 'onMouseClick', 'onMouseMove', 'onFocus', 'onPaste']) {
		if (typeof window[name] !== 'function') window[name] = () => {};
	}

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
		show();

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
			running = false;
		}
	};
})();
