import { loadMatchupData } from "$lib/matchupDataLoader";
import type { MatchupEntry } from "../../../static/data/MatchupEntry";
import type { PlayerWithShortName, TrimmedSettings } from "./types";

/**
 * Converts stage initials to full stage name
 * @param initials - Stage initials (e.g., 'YS' for Yoshi's Story)
 * @returns Full stage name or 'Battlefield' if not found
 */
function stageInitialsToName(initials: string): string {
	const stageNames: { [key: string]: string } = {
		DL: "Dream Land N64",
		YS: "Yoshi's Story",
		PS: "Pokémon Stadium",
		FD: "Final Destination",
		FoD: "Fountain of Dreams",
		BF: "Battlefield",
	};

	return stageNames[initials] || "Battlefield";
}

/**
 * Checks if a matchup entry matches the current stage
 * @param matchupEntry - The matchup entry to check
 * @param stageName - The current stage name
 * @returns true if the entry matches the current stage
 */
function isCurrentStage(matchupEntry: MatchupEntry, stageName: string): boolean {
	return stageInitialsToName(matchupEntry.stage) === stageName;
}

/**
 * Handles the game start event
 * @param settings - Game settings including players and stage
 * @param myConnectCode - The current player's connect code
 * @returns An object containing the updated game state
 */
export async function initGameState(
	settings: TrimmedSettings,
	myConnectCode: string,
): Promise<{
	myChar: string;
	opponentChar: string;
	opponentPlayerIdx: number;
	matchupData: MatchupEntry | undefined;
	displayStageName: string;
	error?: string;
}> {
	const displayStageName = settings.stageName;
	const players: PlayerWithShortName[] = settings.players;

	const isOnline = players.every((player) => player.connectCode);
	const myPlayerIdx = isOnline
		? players.findIndex((player) => player.connectCode === myConnectCode)
		: 0;

	if (myPlayerIdx === -1) {
		const errorMsg = `Connect code "${myConnectCode}" not found in game. Check settings.`;
		return {
			myChar: "",
			opponentChar: "",
			opponentPlayerIdx: 1,
			matchupData: undefined,
			displayStageName,
			error: errorMsg,
		};
	}

	// Validate 1v1 format (not teams)
	if (players.length !== 2) {
		const errorMsg = `Expected 1v1 match but found ${players.length} players. Teams mode not supported.`;
		return {
			myChar: "",
			opponentChar: "",
			opponentPlayerIdx: 1,
			matchupData: undefined,
			displayStageName,
			error: errorMsg,
		};
	}

	const opponentPlayerIdx = myPlayerIdx === 0 ? 1 : 0;

	const myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
	const opponentChar = players[opponentPlayerIdx]?.characterShortName.toLowerCase();

	let matchupData: MatchupEntry | undefined;

	// TODO: Make error message more specific on failing behavior in try
	try {
		const result = await loadMatchupData(myChar, opponentChar);
		console.log("Loaded character matchup data:", result.data);
		matchupData = result.data.find((entry: MatchupEntry) =>
			isCurrentStage(entry, settings.stageName),
		);
	} catch {
		const errorMsg = `Could not load matchup data for ${myChar} vs ${opponentChar}. Check connect code "${myConnectCode}" in settings.`;
		return {
			myChar,
			opponentChar,
			opponentPlayerIdx,
			matchupData: undefined,
			displayStageName,
			error: errorMsg,
		};
	}

	return {
		myChar,
		opponentChar,
		opponentPlayerIdx,
		matchupData,
		displayStageName,
	};
}

/**
 * Extract Opponent Percent
 * @param players - Array of player stats
 * @param opponentPlayerIdx - Index of the opponent player
 * @returns The opponent's current percent or undefined if invalid
 */
export function extractOpponentPercent(
	players: Array<{ percent?: number }>,
	opponentPlayerIdx: number,
): number | undefined {
	return players?.[opponentPlayerIdx]?.percent;
}
