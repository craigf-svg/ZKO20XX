import { loadMatchupData } from "$lib/matchupDataLoader";
import type { MatchupFile, StageEntry } from "../../../static/data/MatchupEntry";
import type { PlayerWithShortName, TrimmedSettings } from "./types";

/**
 * Maps display stage names to the snake_case stage IDs used in the new schema
 */
const STAGE_DISPLAY_TO_ID: Record<string, string> = {
	"Dream Land N64": "dream_land",
	"Yoshi's Story": "yoshis_story",
	"Pokémon Stadium": "pokemon_stadium",
	"Final Destination": "final_destination",
	"Fountain of Dreams": "fountain_of_dreams",
	Battlefield: "battlefield",
};

/**
 * Finds the stage entry matching the current display stage name
 */
function findStageEntry(stages: StageEntry[], displayStageName: string): StageEntry | undefined {
	const stageId = STAGE_DISPLAY_TO_ID[displayStageName];
	if (!stageId) return undefined;
	return stages.find((s) => s.stage === stageId);
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
	matchupData: MatchupFile | undefined;
	stageEntry: StageEntry | undefined;
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
			stageEntry: undefined,
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
			stageEntry: undefined,
			displayStageName,
			error: errorMsg,
		};
	}

	const opponentPlayerIdx = myPlayerIdx === 0 ? 1 : 0;

	const myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
	const opponentChar = players[opponentPlayerIdx]?.characterShortName.toLowerCase();

	let matchupData: MatchupFile | undefined;
	let stageEntry: StageEntry | undefined;

	// TODO: Make error message more specific on failing behavior in try
	try {
		const result = await loadMatchupData(myChar, opponentChar);
		console.log("Loaded character matchup data:", result.data);
		matchupData = result.data;
		stageEntry = findStageEntry(result.data.stages, settings.stageName);
	} catch {
		const errorMsg = `Could not load matchup data for ${myChar} vs ${opponentChar}. Check connect code "${myConnectCode}" in settings.`;
		return {
			myChar,
			opponentChar,
			opponentPlayerIdx,
			matchupData: undefined,
			stageEntry: undefined,
			displayStageName,
			error: errorMsg,
		};
	}

	return {
		myChar,
		opponentChar,
		opponentPlayerIdx,
		matchupData,
		stageEntry,
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
