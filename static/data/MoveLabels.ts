import type { MoveCatalogEntry } from "./MatchupEntry";

export const moveLabels: Record<string, MoveCatalogEntry> = {
	fc_up_smash: { label: "Full Charge Up Smash", shortLabel: "FCUSmash" },
	ut_ua_0_sdi: { label: "Up Throw Up Air (No SDI)", shortLabel: "UTUA 0SDI" },
	ut_ua_1_5_sdi: { label: "Up Throw Up Air (1.5 SDI)", shortLabel: "UTUA 1.5SDI" },
	ut_ua_tas: { label: "Up Throw Up Air (TAS SDI)", shortLabel: "UTUA TAS" },
	up_smash: { label: "Up Smash", shortLabel: "USmash" },
	ss_single_hit_ua: { label: "Single-Hit Up Air", shortLabel: "SH UAir" },
	strong_up_tilt: { label: "Strong Up Tilt", shortLabel: "sUTilt" },
	weak_up_tilt: { label: "Weak Up Tilt", shortLabel: "wUTilt" },
	down_tilt: { label: "Down Tilt", shortLabel: "DTilt" },
	back_air: { label: "Back Air", shortLabel: "Bair" },
	neutral_air: { label: "Neutral Air", shortLabel: "Nair" },
};
