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
    // Test Data
    fakeMove1: 100,
    fakeMove2: 110,
    fakeMove3: 120,
    fakeMove4: 130,
    fakeMove5: 140,
    fakeMove6: 150,
    fakeMove7: 160,
    fakeMove8: 170,
    fakeMove9: 180,
    fakeMove10: 190,
    fakeMove11: 200,
    fakeMove12: 210,
    fakeMove13: 220,
    fakeMove14: 230,
    fakeMove15: 240,
    fakeMove16: 250,
    fakeMove17: 260,
    fakeMove18: 270,
    fakeMove19: 280,
    fakeMove20: 290,
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
  let progress =
    currentPercent && koPercent
      ? `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%`
      : "0%";
  // console.log("to reach", koPercent);
  // console.log("progress ", progress);
  return progress;
}
