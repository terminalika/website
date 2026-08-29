#!/usr/bin/env node
/**
 * Headless smoke test for public/play/terminalika.wasm.
 *
 * Boots the program in Node with stubbed renderer globals (the ones tcell's
 * web screen calls), lets it draw for a moment, presses ESC and expects the
 * Go program to exit cleanly. Run for both the menu and a direct game.
 *
 *   npm run test:wasm
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const play = resolve(here, '../public/play');

// wasm_exec.js defines globalThis.Go when required in Node.
createRequire(import.meta.url)(resolve(play, 'wasm_exec.js'));
const wasmBytes = readFileSync(resolve(play, 'terminalika.wasm'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function boot(args) {
	const stats = { drawCell: 0, show: 0, resize: null };
	Object.assign(globalThis, {
		tkTermSize: { cols: 100, rows: 24 },
		resize: (w, h) => (stats.resize = [w, h]),
		clearScreen: () => {},
		drawCell: () => stats.drawCell++,
		show: () => stats.show++,
		showCursor: () => {},
		setCursorStyle: () => {},
		beep: () => {},
		setTitle: () => {},
	});

	const go = new Go();
	go.argv = ['terminalika', ...args];
	const { instance } = await WebAssembly.instantiate(wasmBytes, go.importObject);
	const exited = go.run(instance).then(() => 'exited');

	await sleep(400); // let it draw a few frames
	if (typeof globalThis.onKeyEvent !== 'function') throw new Error('Go never registered onKeyEvent');
	if (args.length === 0) {
		// menu: move down and up, then leave
		globalThis.onKeyEvent('ArrowDown', false, false, false, false);
		globalThis.onKeyEvent('ArrowUp', false, false, false, false);
		await sleep(50);
	} else {
		// game: a press + release pair, then leave
		globalThis.onKeyEvent('ArrowLeft', false, false, false, false);
		globalThis.onKeyEvent('ArrowLeft', false, false, false, true);
		await sleep(100);
	}
	globalThis.onKeyEvent('Escape', false, false, false, false);

	const result = await Promise.race([exited, sleep(3000).then(() => 'timeout')]);
	// Same cleanup the page's glue does: wasm_exec leaves runtime timers pending
	// after exit and they throw "Go program has already exited" when they fire.
	for (const id of go._scheduledTimeouts?.values?.() ?? []) clearTimeout(id);
	go._scheduledTimeouts?.clear?.();
	go._resume = () => {};
	return { result, stats };
}

let failed = false;
for (const args of [[], ['--game=snake'], ['--game=tetris'], ['--game=invaders'], ['--game=pong']]) {
	const label = args.join(' ') || '(menu)';
	try {
		const { result, stats } = await boot(args);
		const ok = result === 'exited' && stats.drawCell > 0 && stats.show > 0 && Array.isArray(stats.resize);
		console.log(`${ok ? '✓' : '✗'} ${label}: ${result}, resize=${JSON.stringify(stats.resize)}, drawCell=${stats.drawCell}, show=${stats.show}`);
		if (!ok) failed = true;
	} catch (err) {
		console.log(`✗ ${label}: ${err.message}`);
		failed = true;
	}
}
process.exit(failed ? 1 : 0);
