import type { AppSettings } from "$lib/types";
import { Store } from "@tauri-apps/plugin-store";

export const settings = $state<AppSettings>({
  connectCode: "",
  slippiPath: "",
  pollingRate: 500,
  theme: "dark",
  privacyLevel: "allowed"
});

export async function loadSettings() {
  console.log('Loading settings from store...');
  const store = await Store.load("settings.json");
  const saved = await store.get<AppSettings>("settings");
  
  if (saved) {
    console.log('Retrieved settings from store:', JSON.parse(JSON.stringify(saved)));
    for (const key in saved) {
      if (key in settings) {
        (settings as any)[key] = saved[key as keyof AppSettings];
      }
    }
    console.log('Applied settings to state:', JSON.parse(JSON.stringify(settings)));
  } else {
    console.log('No saved settings found, using defaults:', JSON.parse(JSON.stringify(settings)));
    await store.set("settings", settings);
    await store.save();
    console.log('Saved default settings to store');
  }
}

export async function saveSettings() {
  console.log('Saving current settings to store...');
  console.log('Settings to save:', JSON.parse(JSON.stringify(settings)));
  const store = await Store.load("settings.json");
  await store.set("settings", settings);
  await store.save();
  console.log('Settings successfully saved to store');
}

export async function printSettings() {
  console.log('Current settings:', JSON.parse(JSON.stringify(settings)));
}