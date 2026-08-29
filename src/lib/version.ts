/**
 * The launcher's latest published version, fetched once per build from
 * GitHub's releases API. Nothing here is committed, so it can never go
 * stale the way a hand-maintained "vX.Y.Z" string in the docs did.
 */

// Last-known-good version, used only if the GitHub API is unreachable at
// build time (offline dev, rate limiting, an outage). Bump it occasionally
// so a failed fetch doesn't silently ship a very old fallback.
const FALLBACK_VERSION = 'v0.3.3';

async function fetchLatestVersion(): Promise<string> {
	try {
		const res = await fetch('https://api.github.com/repos/terminalika/terminalika/releases/latest');
		if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
		const data = (await res.json()) as { tag_name?: unknown };
		if (typeof data.tag_name !== 'string' || !data.tag_name) {
			throw new Error('response had no tag_name');
		}
		return data.tag_name;
	} catch (err) {
		console.warn(
			`[version] could not fetch the latest terminalika release, falling back to ${FALLBACK_VERSION}:`,
			err
		);
		return FALLBACK_VERSION;
	}
}

// Top-level await: resolved once per build and reused by every importer.
export const latestVersion = await fetchLatestVersion();
