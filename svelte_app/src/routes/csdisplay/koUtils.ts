import type { MatchupEntry } from "../../../static/data/MatchupEntry";

/**
 * Sample dynamic data for testing
 */
export const SAMPLE_DYNAMIC_DATA: MatchupEntry = {
  "fileDone?": false,
  attacker: "Fox",
  defender: "Marth",
  stage: "YS",
  moves: {
    upSmash: 83,
    strongUpTilt: 102,
    downTilt: 145,
    bAir: 124,
    shuAir: 105,
  },
};

/**
 * Determines if the current percent is high enough to highlight a KO move
 * @param currentPercent - The opponent's current damage percentage
 * @param koPercent - The percentage at which the move becomes a KO option
 * @returns true if the move should be highlighted as a KO option
 */
export function isKoPercentReached(currentPercent: number, koPercent: number): boolean {
  return currentPercent >= koPercent;
}

/**
 * Calculates the width percentage for progress bars showing KO proximity
 * @param currentPercent - The opponent's current damage percentage
 * @param koPercent - The percentage at which the move becomes a KO option
 * @returns A percentage string for CSS width (capped at 100%)
 */
export function calculateKoProgressWidth(currentPercent: number, koPercent: number): string {
  return currentPercent && koPercent
    ? `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%`
    : "0%";
}
