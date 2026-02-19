import { expect, it } from "vitest";
import { getMoveIcon, getPriorityColor } from "../src/routes/csdisplay/iconMapping";

it("covers IconMapping helpers", () => {
	expect(getMoveIcon("up_smash")).toBe("ArrowUp");
	expect(getMoveIcon("strong_up_tilt")).toBe("ArrowUp");
	expect(getMoveIcon("down_tilt")).toBe("ArrowDown");
	expect(getMoveIcon("back_air")).toBe("Undo2");
	expect(getMoveIcon("jab")).toBe("ChevronRight");

	expect(getPriorityColor(80, 70)).toBe("neutral");
	expect(getPriorityColor(80, 90)).toBe("danger");

	const arr: number[] = [60, 70, 90];
	expect(getPriorityColor(arr, 40)).toBe("neutral");
	expect(getPriorityColor(arr, 65)).toBe("warning");
	expect(getPriorityColor(arr, 95)).toBe("danger");
});
