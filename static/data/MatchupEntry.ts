export interface MatchupEntry {
	"fileDone?"?: boolean;
	attacker: string;
	defender: string;
	stage: string;
	moves: {
		[key: string]: number | number[];
	};
}
