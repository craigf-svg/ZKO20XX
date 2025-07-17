<script lang="ts">
  import Logo from "$lib/Logo.svelte";

  let darkModeEnabled = $state(false);

  function toggleDarkMode() {
    darkModeEnabled = !darkModeEnabled;
  }
</script>

<nav>
  <ul>
    <li><a href="/" class="link"><Logo /></a></li>
    <li>
      <button type="button" class="link" onclick={toggleDarkMode}
        >Dark Mode {darkModeEnabled ? "ON" : "OFF"}</button
      >
    </li>
    <li>
      <a href="/lab" class="link">Lab</a>
    </li>
    <li>
      <a href="/about" class="link">About</a>
    </li>
    <li>
      <a href="/settings" class="link">Settings</a>
    </li>
  </ul>
</nav>

<style>
:root {
  --navbar-height: 46px;
}
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--color-bg-navbar);
  display: flex;
  height: var(--navbar-height);
  align-items: center;
}
li {
  padding: 0;
}
li:first-child {
  margin-right: auto;
}
.link {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-text-main);
  font-weight: 100;
  padding: 0 8px;
}
.link:hover {
  background-color: var(--color-border);
  cursor: pointer;
}

</style>
