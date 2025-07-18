<script lang="ts">
  import { getContext } from 'svelte';
  import type { AppSettings } from '$lib/types';
  const settings = getContext<AppSettings>('app-settings');
  $effect(() => console.log('Settings from context:', JSON.stringify(settings, null, 2)));

  function saveConnectCode(code: string) {
    settings.connectCode = code;
    console.log('Connect code saved:', code);
  }

  function saveSlippiPath(path: string) {
    settings.slippiPath = path;
    console.log('Slippi path saved:', path);
  }

  function savePollingRate(rate: number) {
    settings.pollingRate = rate;
    console.log('Polling rate saved:', rate);
  }

  let connectCode = $state(settings.connectCode);
  let slippiPath = $state(settings.slippiPath);
  let pollingRate = $state(settings.pollingRate);
</script>
<div>Hi</div>
<div id="body">
  <div class="form-container">
    <h2>Settings</h2>
    
    <div class="form-group">
      <label class="form-label">
        Connect Code
          <div class="input-group">
            <input type="text" id="codeInput" bind:value={connectCode} placeholder="BLU#007" />
            <button onclick={() => saveConnectCode(connectCode)}>Save</button>
          </div>
      </label>
    </div>
    
    <div class="form-group">
      <label class="form-label">
        Slippi Folder Path
          <div class="input-group">
            <input type="text" bind:value={slippiPath} placeholder="C:\Users\Username\Documents\Slippi" />
            <button onclick={() => saveSlippiPath(slippiPath)}>Save</button>
          </div>
      </label>
    </div>
    
    <div class="form-group">
      <label class="form-label">
        Polling rate
          <div class="input-group">
            <input type="number" bind:value={pollingRate} placeholder="500" />
            <button onclick={() => savePollingRate(pollingRate)}>Save</button>
          </div>
      </label>
    </div>


    <div class="form-group">
      <button class="restore-button">Restore Defaults</button>
    </div>
  </div>
</div>

<style>
  #body {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .form-container {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e5e9;
  }
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: #2d3748;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: white;
  }
  
  input:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
  
  input::placeholder {
    color: #a0aec0;
  }
  
  button {
    padding: 0.75rem 1rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  button:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .restore-button {
    background: #e53e3e;
    padding: 0.75rem 1.5rem;
  }
  
  .restore-button:hover {
    background: #c53030;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  @media (max-width: 640px) {
    #body {
      padding: 1rem;
    }
    
    .form-container {
      padding: 1.5rem;
    }
    
    .input-group {
      flex-direction: column;
      align-items: stretch;
    }
    
    .input-group button {
      margin-top: 0.5rem;
    }
  }
</style>
