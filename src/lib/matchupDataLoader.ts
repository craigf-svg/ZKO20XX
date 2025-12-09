import { appDataDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, open } from "@tauri-apps/plugin-fs";
import type { MatchupEntry } from "../../static/data/MatchupEntry";

function validateMatchupData(data: unknown): data is MatchupEntry[] {
	if (!Array.isArray(data)) return false;
	return data.every(
		(entry) =>
			entry &&
			typeof entry === "object" &&
			typeof entry.stage === "string" &&
			typeof entry.attacker === "string" &&
			typeof entry.defender === "string" &&
			typeof entry.moves === "object" &&
			entry.moves !== null,
	);
}

function notTauri(): boolean {
	const isTauri: boolean = typeof window !== "undefined" && "__TAURI__" in window;
	return !isTauri;
}

const MATCHUP_DATA_DIR_NAME = "matchup_data";

async function fetchBundledData(bundledPath: string): Promise<MatchupEntry[]> {
	const response = await fetch(bundledPath, { signal: AbortSignal.timeout(5000) });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const parsed = await response.json();
	if (!validateMatchupData(parsed)) {
		throw new Error("Invalid matchup data format in bundled file");
	}
	return parsed;
}

/**
 * Loads matchup data from user's app data directory editable by user
 * Falls back to bundled static data if file not found
 *
 * @param myChar - Character name (e.g., "fox")
 * @param opponentChar - Opponent character name (e.g., "falco")
 * @returns Array of matchup entries for all stages
 */
export async function loadMatchupData(
	myChar: string,
	opponentChar: string,
): Promise<MatchupEntry[]> {
	const bundledPath = `/data/${myChar}/vs_${opponentChar}.json`;

	if (notTauri()) {
		return fetchBundledData(bundledPath);
	}

	try {
		const relativePath = `${MATCHUP_DATA_DIR_NAME}/${myChar}/vs_${opponentChar}.json`;
		const file = await open(relativePath, { read: true, baseDir: BaseDirectory.AppData });
		try {
			const stat = await file.stat();
			const buf = new Uint8Array(stat.size);
			await file.read(buf);
			const parsed = JSON.parse(new TextDecoder().decode(buf));
			if (!validateMatchupData(parsed)) {
				throw new Error("Invalid matchup data format in user file");
			}
			console.log(`Loaded matchup data from user directory: ${relativePath}`);
			return parsed;
		} finally {
			await file.close();
		}
	} catch (e) {
		console.warn(`Could not load from user directory, falling back to bundled:`, e);
		return fetchBundledData(bundledPath);
	}
}

export async function getMatchupDataPath(): Promise<string | null> {
	if (notTauri()) return null;
	try {
		const appData = await appDataDir();
		return await join(appData, MATCHUP_DATA_DIR_NAME);
	} catch (e) {
		console.error("Failed to get matchup data path:", e);
		return null;
	}
}
