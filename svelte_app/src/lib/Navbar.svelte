<script lang="ts">
  import Logo from '$lib/Logo.svelte'
</script>
	
<style>
  /*
  located in +layout now
:root {   */
  /*   --color-text-main: #f0f0f0; */
  /*   --color-text-heading: #ffffff; */
  /*   --color-orange-main: #ff3e00; */
  /*   --color-orange-logo: #ff6836; */
  /*   --color-orange-secondary: #ffa500; */
  /*   --color-purple-flair: #7c4dff; */
  /*   --color-bg-body: #2b2b2b; */
  /*   --color-bg-navbar: #333333; */
  /*   --color-bg-navbar-hover: #444444; */
  /*   --color-muted: #888888; */
  /*   --color-border: #444444; */
  /*   --background-color: #ff4444; */
  /*   --transition: 250ms ease-out; */
  /* } */
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--color-bg-navbar);
    display: flex;
    align-items: center;
  }
  li:first-child {
    margin-right: auto;
  }
  .link {
    display: block;
    font-weight: 100;
    text-align: center;
    padding: 0.2em 1em;
    text-decoration: none;
    color: var(--color-text-main);
  }
	.link:hover {
	  background-color: var(--color-border);
	  cursor: pointer;
	}
</style>

<nav>
  <ul>
    <li><a href="/" class="link"><Logo /></a></li>
    <!-- <li><a>Thank you for your patience C ♥ and Ears (^. .^)⟆.</a></li> -->
    <!-- <li><a>20XX has arrived now.</a></li> -->
    <li class="link">
      <p>Dark Mode</p>
    </li>
    <li>
      <a href="/lab" class="link">
        Lab
      </a>
    </li>
    <li>
      <a href="/about" class="link">
        About
      </a>
    </li>
    <li>
      <a href="/settings" class="link">
        Settings
      </a>
    </li>
  </ul>
</nav>

