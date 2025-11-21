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
