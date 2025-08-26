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
  myConnectCode: string
): Promise<{
  myChar: string;
  opponentChar: string;
  opponentPlayerIdx: number;
  matchupData: MatchupEntry | undefined;
  displayStageName: string;
}> {
  const displayStageName = settings.stageName;
  const players: PlayerWithShortName[] = settings.players;
  
  let myPlayerIdx = 0;
  let opponentPlayerIdx = 1;
  
  if (players[0]?.connectCode !== undefined) {
    myPlayerIdx = players.findIndex(
      (p: PlayerWithShortName) => p?.connectCode === myConnectCode
    );
    opponentPlayerIdx = players.findIndex(
      (p: PlayerWithShortName) => p?.connectCode !== myConnectCode
    );
    
    // Probably local match, fallback to defaults 
    if (opponentPlayerIdx === -1) {
      myPlayerIdx = 0;
      opponentPlayerIdx = 1;
    }
  }

  const myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
  const opponentChar = players[opponentPlayerIdx]?.characterShortName.toLowerCase();

  let matchupData: MatchupEntry | undefined;
  // Find matchup file based on characters
  const matchupPath = `/data/${myChar}/vs_${opponentChar}.json`;

  try {
    const response = await fetch(matchupPath);
    const allStagesKOData: MatchupEntry[] = await response.json();
    console.log("Loaded character matchup data:", allStagesKOData);
    matchupData = allStagesKOData.find((entry: MatchupEntry) =>
      isCurrentStage(entry, settings.stageName)
    );
    console.log("currentStageData", matchupData);
  } catch (e) {
    console.error("Could not load matchup data for ", matchupPath, e);
    console.log(`Make sure your file path "${matchupPath}" and your connect code "${myConnectCode}" are set correctly in settings!`);
    matchupData = undefined;
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
  opponentPlayerIdx: number
): number | undefined {
  console.log("Received an event with info ", JSON.stringify(players));
  if (
    players &&
    players[opponentPlayerIdx] &&
    typeof players[opponentPlayerIdx].percent === "number"
  ) {
    const currentPercent = players[opponentPlayerIdx].percent;
    // console.log("currentPercent:", currentPercent);
    return currentPercent;
  } else {
    console.log("Invalid data received.");
    return undefined;
  }
}
