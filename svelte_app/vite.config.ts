import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: { environment: "jsdom" },
	resolve: process.env.VITEST
		? {
				conditions: ["browser"],
			}
		: undefined,
});
