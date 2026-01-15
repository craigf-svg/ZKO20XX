import { appDataDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, open, exists } from "@tauri-apps/plugin-fs";
import type { MatchupEntry } from "../../static/data/MatchupEntry";

export type MatchupDataSource = "user" | "bundled";

export interface MatchupDataResult {
	data: MatchupEntry[];
	source: MatchupDataSource;
}

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

function isTauri(): boolean {
	return globalThis.window !== undefined && "__TAURI__" in globalThis.window;
}

const MATCHUP_DATA_DIR_NAME = "matchup_data";

async function getMatchupDataDir(): Promise<string> {
	const appData = await appDataDir();
	return await join(appData, MATCHUP_DATA_DIR_NAME);
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
): Promise<MatchupDataResult> {
	const bundledPath = `/data/${myChar}/vs_${opponentChar}.json`;

	if (!isTauri()) {
		const response = await fetch(bundledPath, { signal: AbortSignal.timeout(5000) });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return { data: await response.json(), source: "bundled" };
	}

	try {
		const relativePath = `${MATCHUP_DATA_DIR_NAME}/${myChar}/vs_${opponentChar}.json`;
		const file = await open(relativePath, {
			read: true,
			baseDir: BaseDirectory.AppData,
		});

		try {
			const stat = await file.stat();
			const buf = new Uint8Array(stat.size);
			await file.read(buf);
			const textContents = new TextDecoder().decode(buf);

			const parsed = JSON.parse(textContents);
			if (!validateMatchupData(parsed)) {
				throw new Error("Invalid matchup data format in user file");
			}

			console.log(`Loaded matchup data from user directory: ${relativePath}`);
			return { data: parsed, source: "user" };
		} finally {
			await file.close();
		}
	} catch (e) {
		console.warn(
			`Could not load matchup data from user directory, falling back to bundled data:`,
			e,
		);
	}

	const response = await fetch(bundledPath, { signal: AbortSignal.timeout(5000) });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const parsed = await response.json();
	if (!validateMatchupData(parsed)) {
		throw new Error("Invalid matchup data format in bundled file");
	}
	console.log(`Loaded matchup data from bundled assets: ${bundledPath}`);
	return { data: parsed, source: "bundled" };
}

export async function getMatchupDataPath(): Promise<string | null> {
	if (!isTauri()) return null;
	try {
		const dir = await getMatchupDataDir();
		const folderExists = await exists(MATCHUP_DATA_DIR_NAME, {
			baseDir: BaseDirectory.AppData,
		});
		if (!folderExists) {
			return null;
		}
		return dir;
	} catch (e) {
		console.error("Failed to get matchup data path:", e);
		return null;
	}
}
