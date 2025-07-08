export interface MatchupEntry {
  attacker: string;
  defender: string;
  stage: string;
  moves: { [key: string]: number };
}
