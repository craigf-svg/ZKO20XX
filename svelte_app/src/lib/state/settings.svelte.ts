import type { AppSettings } from "$lib/types";

export const settings = $state<AppSettings>({
  connectCode: "",
  slippiPath: "",
  pollingRate: 700,
  theme: "dark",
});