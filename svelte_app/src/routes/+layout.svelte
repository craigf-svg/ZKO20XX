<script lang="ts">
	import "../app.css";
	import Navbar from "$lib/Navbar.svelte";
	import { setContext } from "svelte";
	import type { AppSettings } from "$lib/types";
	const { children } = $props();

	type Theme = 'light' | 'dark';
	let theme = $state<Theme>('dark');
	document.documentElement.setAttribute('data-theme', 'dark');

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', theme);
	}

	// Create reactive state with runes and proper typing
	const settings = $state<AppSettings>({
		connectCode: "",
		slippiPath: "",
		pollingRate: 700,
	});

	setContext<AppSettings>("app-settings", settings);
</script>

<style>
	@font-face {
		font-family: "Playfair Display";
		font-style: normal;
		font-weight: 400;
		src: url("/fonts/Playfair_Display/PlayfairDisplay-Regular.ttf")
			format("truetype");
	}
	:global(:root) {
		/* Light theme colors (default) */
		--color-text-main: #333333;
		--color-text-heading: #000000;
		--color-orange-main: #ff3e00;
		--color-orange-main-faint: rgba(255, 62, 0, 0.1);
		--color-orange-logo: #ff6836;
		--color-orange-logo-secondary: orange;
		--color-orange-secondary: #ff8c00;
		--color-purple-flair: #7c4dff;
		--color-bg-body: #f5f5f5;
		--color-bg-navbar: #ffffff;
		--color-bg-navbar-hover: #f0f0f0;
		--color-muted: #666666;
		--color-border: #e0e0e0;
		--background-color: #ff4444;
		--transition: 250ms ease-out;
	}

	:global([data-theme="dark"]) {
		/* Dark theme colors */
		--color-text-main: #f0f0f0;
		--color-text-heading: #ffffff;
		--color-orange-main: #ff3e00;
		--color-orange-main-faint: rgba(255, 62, 0, 0.2);
		--color-orange-logo: #ff6836;
		--color-orange-logo-secondary: orange;
		--color-orange-secondary: #ffa500;
		--color-purple-flair: #7c4dff;
		--color-bg-body: #2b2b2b;
		--color-bg-navbar: #333333;
		--color-bg-navbar-hover: #444444;
		--color-muted: #888888;
		--color-border: #444444;
	}
	/* TO DO ADD GRADIENT LIKE IN settings thanks*/
	:global(body) {
		font-family: system-ui;
		transition: background-color 0.3s, color 0.3s;
		/* font-family: 'Playfair Display'; */
		background-color: var(--color-bg-body);
		color: var(--color-text-main);
		margin: 0;
		min-height: 100vh;
	}

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		background-color: transparent;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

<Navbar theme={theme} onToggleTheme={toggleTheme} />
<main data-theme={theme}>
  {@render children()}
</main>