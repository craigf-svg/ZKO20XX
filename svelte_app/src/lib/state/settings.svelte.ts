import type { AppSettings } from "$lib/types";

export const settings = $state<AppSettings>({
  connectCode: "",
  slippiPath: "",
  pollingRate: 500,
  theme: "dark",
  privacyLevel: "allowed",
  snoozeUntil: undefined,
});

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export async function loadSettings() {
  try {
    if (!isTauri()) {
      console.log("Tauri not detected; skipping settings store load. Using defaults in memory.");
      return;
    }

    console.log('Loading settings from store...');
    const { Store } = await import("@tauri-apps/plugin-store");
    const settingsStore = await Store.load("settings.json");
    const saved_settings = await settingsStore.get<AppSettings>("settings");

    console.log('Raw saved_settings:', saved_settings);
    console.log('Type of saved_settings:', typeof saved_settings);
    console.log('Is saved_settings truthy?', !!saved_settings);

    // Saved Settings Found 
    if (saved_settings) {
      console.log('Retrieved settings from store:', saved_settings);
      for (const key in saved_settings) {
        if (key in settings) {
          (settings as any)[key] = saved_settings[key as keyof AppSettings];
        }
      }
      console.log('Applied settings to state:', JSON.parse(JSON.stringify(settings)));
    } else {
      console.log('No saved settings found, using default settings:', settings);
      await settingsStore.set("settings", settings);
      await settingsStore.save();
      console.log('Saved default settings to store');
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
    console.log('Saving current settings to store...');
    console.log('Settings to save:', JSON.parse(JSON.stringify(settings)));
    const { Store } = await import("@tauri-apps/plugin-store");
    const store = await Store.load("settings.json");
    await store.set("settings", settings);
    await store.save();
    console.log('Settings successfully saved to store');
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}

export async function printSettings() {
  console.log('Current settings:', $state.snapshot(settings))
}