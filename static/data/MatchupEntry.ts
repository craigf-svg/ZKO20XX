export interface MoveCatalogEntry {
	label: string;
	shortLabel: string;
}

export interface StageEntry {
	stage: string;
	moves: Record<string, number | number[]>;
}

export interface MatchupFile {
	character: string;
	opponent: string;
	moveCatalog: Record<string, MoveCatalogEntry>;
	stages: StageEntry[];
}
