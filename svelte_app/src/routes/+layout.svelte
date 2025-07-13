<script>
	import '../app.css';
	import Navbar from '$lib/Navbar.svelte';
</script>

<style>
	@font-face {
  	font-family: 'Playfair Display';
  	font-style: normal;
  	font-weight: 400;
  	src: url('/fonts/Playfair_Display/PlayfairDisplay-Regular.ttf') format('truetype');
	}
	:global(:root) {
  	--color-text-main: #f0f0f0;
  	--color-text-heading: #ffffff;
  	--color-orange-main: #ff3e00;
  	--color-orange-main-faint: rgba(255, 62, 0, 0.2);
  	--color-orange-logo: #ff6836;
  	--color-orange-secondary: #ffa500;
  	--color-purple-flair: #7c4dff;
  	--color-bg-body: #2b2b2b;
  	--color-bg-navbar: #333333;
  	--color-bg-navbar-hover: #444444;
  	--color-muted: #888888;
  	--color-border: #444444;
  	--background-color: #ff4444;
  	--transition: 250ms ease-out;
	}
	:global(body) {
			font-family: Arial;
			font-family: Verdana;
			font-family: Tahoma;
			font-family: "Trebuchet MS";
			font-family: Helvetica;
			font-family: "Times New Roman";
			font-family: Georgia;
			font-family: Garamond;
			font-family: "Courier New";
			font-family: system-ui;
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

<Navbar />
<main>
  <slot />
</main>
