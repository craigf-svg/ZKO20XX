import { it } from 'vitest';
import { loadSettings, saveSettings, printSettings } from '../src/lib/state/settings.svelte';

it('covers settings helpers in non-tauri env', async () => {
  // @ts-expect-error
  globalThis.window = undefined;

  await loadSettings();
  await saveSettings();
  await printSettings();
});
