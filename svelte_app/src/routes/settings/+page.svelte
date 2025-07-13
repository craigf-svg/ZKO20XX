<script lang="ts">
 // import { env } from '$env/dynamic/public';
 // const MY_CONNECT_CODE: string = env.PUBLIC_CONNECT_CODE;

  let connectCode = $state("");
  let slippiPath = $state("");
  let pollingRate = $state(500);
  let loading = false;

  function saveConnectCode(newCode) {
    if(validConnectCode(newCode)){
      alert(`Connect code saved: ${connectCode}`);
    }
  }
  function saveSlippiPath(newPath) {
    alert(`Slippi folder path saved: ${slippiPath}`);
  }
 function savePollingRate(newRate) {
    alert(`Polling Rate Saved`)
 }
  function validConnectCode(code:string) {
    if(code.length != 7) {
      alert(`Error: code length is not 7 characters long`) 
      return false
    } else {
      alert(`Valid code, well done`);
      return true
    }
  }
</script>

<div id="body">
  <div class="form-container">
    <h2>Settings</h2>
    
    <div class="form-group">
      <label class="form-label">
        Connect Code
        {#if loading}
          <div class="skeleton-input"></div>
          <div class="skeleton-button"></div>
        {:else}
          <div class="input-group">
            <input type="text" id="codeInput" bind:value={connectCode} placeholder="BLU#007" />
            <button onclick={() => saveConnectCode(connectCode)}>Save</button>
          </div>
        {/if}
      </label>
    </div>
    
    <div class="form-group">
      <label class="form-label">
        Slippi Folder Path
        {#if loading}
          <div class="skeleton-input"></div>
          <div class="skeleton-button"></div>
        {:else}
          <div class="input-group">
            <input type="text" bind:value={slippiPath} placeholder="C:\Users\Username\Documents\Slippi" />
            <button onclick={saveSlippiPath}>Save</button>
          </div>
        {/if}
      </label>
    </div>
    
    <div class="form-group">
      <label class="form-label">
        Polling rate
        {#if loading}
          <div class="skeleton-input"></div>
          <div class="skeleton-button"></div>
        {:else}
          <div class="input-group">
            <input type="number" bind:value={pollingRate} placeholder={500} />
            <button onclick={savePollingRate}>Save</button>
          </div>
        {/if}
      </label>
    </div>


    <div class="form-group">
      {#if loading}
        <div class="skeleton-text"></div>
      {:else}
        <button class="restore-button">Restore Defaults</button>
      {/if}
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
  
  .skeleton-input {
    width: 100%;
    height: 42px;
    background: linear-gradient(90deg, #f7fafc 25%, #edf2f7 50%, #f7fafc 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }
  
  .skeleton-button {
    width: 60px;
    height: 42px;
    background: linear-gradient(90deg, #f7fafc 25%, #edf2f7 50%, #f7fafc 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
    margin-left: 0.5rem;
    display: inline-block;
  }
  
  .skeleton-text {
    width: 120px;
    height: 42px;
    background: linear-gradient(90deg, #f7fafc 25%, #edf2f7 50%, #f7fafc 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
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
