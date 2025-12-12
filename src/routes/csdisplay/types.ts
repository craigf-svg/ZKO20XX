import type { MatchupEntry } from "../../../static/data/MatchupEntry";

export interface MoveBar {
	moveName: string;
	koPercent: number | number[];
	width: string;
	highlight: "none" | "dim" | "full";
}

export interface PlayerWithShortName extends PlayerType {
	characterShortName: string;
}

export interface TrimmedSettings {
	players: PlayerWithShortName[];
	stageName: string;
}

export interface PlayerStats {
	character?: string;
	percent?: number;
}

export interface CombatSystemGameState {
	matchupData: MatchupEntry | undefined;
	currentPercent: number | undefined;
	displayStageName: string | undefined;
	myChar: string;
	opponentChar: string;
	opponentPlayerIdx: number;
	myConnectCode: string;
	opponentConnectCode: string;
	error?: string;
}

export interface CombatSystemViewState {
	limit: number;
}

// From Slippi-js
export interface PlayerType {
	playerIndex: number;
	port: number;
	characterId: number | null;
	type: number | null;
	startStocks: number | null;
	characterColor: number | null;
	teamShade: number | null;
	handicap: number | null;
	teamId: number | null;
	staminaMode: boolean | null;
	silentCharacter: boolean | null;
	invisible: boolean | null;
	lowGravity: boolean | null;
	blackStockIcon: boolean | null;
	metal: boolean | null;
	startOnAngelPlatform: boolean | null;
	rumbleEnabled: boolean | null;
	cpuLevel: number | null;
	offenseRatio: number | null;
	defenseRatio: number | null;
	modelScale: number | null;
	controllerFix: string | null;
	nametag: string | null;
	displayName: string;
	connectCode: string;
	userId: string;
}
