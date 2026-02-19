import type { MatchupFile, StageEntry } from "../../../static/data/MatchupEntry";

/**
 * Sample dynamic data for testing
 */
export const SAMPLE_MATCHUP_DATA: MatchupFile = {
	character: "fox",
	opponent: "default_data",
	moveCatalog: {
		default_data: { label: "Default Data", shortLabel: "Default" },
	},
	stages: [
		{
			stage: "yoshis_story",
			moves: {
				default_data: 1,
			},
		},
	],
};

export const SAMPLE_STAGE_ENTRY: StageEntry = SAMPLE_MATCHUP_DATA.stages[0];

/**
 * Determines if the current percent is high enough to highlight a KO move
 * @param currentPercent - The opponent's current damage percentage
 * @param koPercent - The percentage at which the move becomes a KO option
 * @returns true if the move should be highlighted as a KO option
 */
export function koPercentReached(
	currentPercent: number,
	koPercent: number | number[],
): "none" | "dim" | "full" {
	if (!Array.isArray(koPercent)) return currentPercent >= koPercent ? "full" : "none";

	if (currentPercent >= koPercent[2]) {
		return "full";
	} else if (currentPercent >= koPercent[0]) {
		return "dim";
	} else {
		return "none";
	}
}

/**
 * Calculates the width percentage for progress bars showing KO proximity
 * @param currentPercent - The opponent's current damage percentage
 * @param koPercent - The percentage at which the move becomes a KO option
 * @returns A percentage string for CSS width (capped at 100%)
 */
export function calculateProgress(currentPercent: number, koPercent: number | number[]): string {
	koPercent = Array.isArray(koPercent) ? koPercent[2] : koPercent;
	const progress =
		currentPercent && koPercent
			? `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%`
			: "0%";
	return progress;
}
