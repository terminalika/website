#!/usr/bin/env node
/**
 * Theme rule checker for src/styles/terminal.css (see CLAUDE.md).
 *
 * 1. Every `--tk-*` colour token defined in the DARK block must also be
 *    defined in the LIGHT block, and vice versa.
 * 2. The no-JS `@media (prefers-color-scheme: light)` fallback must define
 *    the same set as the LIGHT block.
 * 3. Any extra palette (`[data-palette='x']`) must define the same tokens
 *    for both `data-theme='dark'` and `data-theme='light'`.
 * 4. No raw colour values (hex, rgb(), hsl(), named colours) may appear
 *    outside the palette sections; everything else must use var(--tk-*).
 *
 * Exit code 1 with a readable report when any rule is broken.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(here, '../src/styles/terminal.css');
const css = readFileSync(cssPath, 'utf8');

const problems = [];

/** Collect `--tk-*` token names declared inside the first `{...}` after a selector match. */
function tokensIn(selectorRegex, label) {
	const m = css.match(selectorRegex);
	if (!m) {
		problems.push(`missing block: ${label}`);
		return new Set();
	}
	const start = css.indexOf('{', m.index) + 1;
	let depth = 1;
	let i = start;
	for (; i < css.length && depth > 0; i++) {
		if (css[i] === '{') depth++;
		else if (css[i] === '}') depth--;
	}
	const body = css.slice(start, i - 1);
	return new Set([...body.matchAll(/--tk-[a-z0-9-]+(?=\s*:)/g)].map((x) => x[0]));
}

// Non-colour tokens live in the shared block and are exempt from pairing.
const shared = tokensIn(/^:root\s*\{/m, 'shared :root');

const dark = tokensIn(/^:root,\s*\n:root\[data-theme='dark'\]\s*\{/m, 'DARK block');
const light = tokensIn(/^:root\[data-theme='light'\]\s*\{/m, 'LIGHT block');
const fallback = tokensIn(
	/@media \(prefers-color-scheme: light\)\s*\{\s*:root:not\(\[data-theme\]\)\s*\{/m,
	'no-JS light fallback'
);

function diff(a, b, aName, bName) {
	for (const t of a) if (!b.has(t) && !shared.has(t)) problems.push(`${t} is set in ${aName} but not in ${bName}`);
}
diff(dark, light, 'DARK', 'LIGHT');
diff(light, dark, 'LIGHT', 'DARK');
diff(light, fallback, 'LIGHT', 'the no-JS fallback');
diff(fallback, light, 'the no-JS fallback', 'LIGHT');

// Extra palettes: each must define the same tokens in both modes.
const paletteNames = new Set([...css.matchAll(/\[data-palette='([a-z0-9-]+)'\]/g)].map((m) => m[1]));
for (const name of paletteNames) {
	const d = tokensIn(
		new RegExp(`:root\\[data-palette='${name}'\\],\\s*\\n:root\\[data-palette='${name}'\\]\\[data-theme='dark'\\]\\s*\\{`, 'm'),
		`palette "${name}" dark block`
	);
	const l = tokensIn(new RegExp(`^:root\\[data-palette='${name}'\\]\\[data-theme='light'\\]\\s*\\{`, 'm'), `palette "${name}" light block`);
	diff(d, l, `palette "${name}" dark`, `palette "${name}" light`);
	diff(l, d, `palette "${name}" light`, `palette "${name}" dark`);
}

// Raw colours outside the palette sections.
const sectionStart = css.indexOf('/* ---- 2.');
const sectionEnd = css.indexOf('/* ---- 7.');
const body = css.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, '');
const rawColour =
	/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|color)\(|\b(?:white|black|red|green|blue|orange|yellow|gray|grey)\b(?=\s*[;,)])/gi;
for (const line of withoutComments.split('\n')) {
	// `transparent`, `currentColor` and `none` are allowed; they carry no palette.
	if (rawColour.test(line)) problems.push(`raw colour outside the palette sections: ${line.trim()}`);
	rawColour.lastIndex = 0;
}

if (problems.length) {
	console.error(`theme check failed (${cssPath}):\n`);
	for (const p of problems) console.error(`  ✗ ${p}`);
	console.error(`\n${problems.length} problem(s). Every colour must be a --tk-* token defined for both dark and light.`);
	process.exit(1);
}

console.log(`theme check ok: ${dark.size} tokens defined for dark + light` + (paletteNames.size ? `, palettes: ${[...paletteNames].join(', ')}` : ''));
