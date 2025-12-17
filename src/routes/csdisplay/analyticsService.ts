import type { AppSettings } from "$lib/types";

function isTauri(): boolean {
	return globalThis.window !== undefined && "__TAURI__" in globalThis.window;
}

export async function trackIfAllowed(
	eventName: string,
	privacyLevel: AppSettings["privacyLevel"],
): Promise<void> {
	if (privacyLevel !== "allowed") return;
	if (!isTauri()) return;

	try {
		const { trackEvent } = await import("@aptabase/tauri");
		await trackEvent(eventName);
	} catch (err) {
		console.warn("Failed to track event:", eventName, err);
	}
}
