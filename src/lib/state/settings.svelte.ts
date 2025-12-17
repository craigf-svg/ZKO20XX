import type { AppSettings } from "$lib/types";

export const settings = $state<AppSettings>({
	connectCode: "",
	slippiPath: "",
	pollingRate: 500,
	theme: "dark",
	privacyLevel: "allowed",
	snoozeUntil: undefined,
	iceUnlocked: false,
});

function isTauri(): boolean {
	return globalThis.window !== undefined && "__TAURI__" in globalThis.window;
}

export async function loadSettings() {
	try {
		if (!isTauri()) {
			console.log("Tauri not detected; skipping settings store load. Using defaults in memory.");
			return;
		}

		const { Store } = await import("@tauri-apps/plugin-store");
		const settingsStore = await Store.load("settings.json");

		const saved_settings = await settingsStore.get<AppSettings>("settings");

		// Saved Settings Found
		if (saved_settings) {
			for (const key in saved_settings) {
				if (key in settings) {
					(settings as any)[key] = saved_settings[key as keyof AppSettings];
				}
			}
		} else {
			const defaultSnapshot = $state.snapshot(settings);
			await settingsStore.set("settings", defaultSnapshot);
			await settingsStore.save();
		}
	} catch (err) {
		console.error("Failed to load settings:", err);
	}
}

export async function saveSettings() {
	try {
		if (!isTauri()) {
			console.log("Tauri not detected; skipping settings store save.");
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 0));
		const settingsSnapshot = $state.snapshot(settings);
		const { Store } = await import("@tauri-apps/plugin-store");
		const store = await Store.load("settings.json");
		await store.set("settings", settingsSnapshot);
		await store.save();
	} catch (err) {
		console.error("Failed to save settings:", err);
	}
}

export async function printSettings() {
	console.log("Current settings:", $state.snapshot(settings));
}
