export const getMoveIcon = (moveId: string): string => {
	if (
		moveId.includes("up_tilt") ||
		moveId.includes("up_smash") ||
		moveId.includes("up_air") ||
		moveId.includes("_ua")
	) {
		return "ArrowUp";
	} else if (
		moveId.includes("down") ||
		moveId.includes("d_air") ||
		moveId.includes("d_smash") ||
		moveId.includes("d_tilt")
	) {
		return "ArrowDown";
	} else if (moveId.includes("back") || moveId.includes("b_air")) {
		return "Undo2";
	}

	return "ChevronRight";
};

export const getPriorityColor = (koPercent: number | number[], currentPercent: number): string => {
	if (Array.isArray(koPercent)) {
		const [min, , max] = koPercent;
		if (currentPercent >= max) {
			return "danger";
		}
		if (currentPercent >= min) {
			return "warning";
		}
		return "neutral";
	}

	return currentPercent >= koPercent ? "danger" : "neutral";
};
