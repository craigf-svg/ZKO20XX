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
    upSmash: [81, 82, 91], // { in: 81, neutral: 82, out: 91 },
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
export function koPercentReached(
  currentPercent: number,
  koPercent: number | number[],
): "none" | "dim" | "full" {
  if (!Array.isArray(koPercent))
    return currentPercent >= koPercent ? "full" : "none";

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
export function calculateProgress(
  currentPercent: number,
  koPercent: number | number[],
): string {
  koPercent = Array.isArray(koPercent) ? koPercent[2] : koPercent;
  console.log("to reach", koPercent);
  let progress =
    currentPercent && koPercent
      ? `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%`
      : "0%";
  console.log("progress ", progress);
  return progress;
}
