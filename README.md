# ZKO_20XX

A cross-platform desktop app built for Super Smash Bros. Melee data visualization and analysis using Tauri, Rust, Node, and Svelte. 


## Quick Setup
```bash
# Clone the repository
git clone [repo-url]
cd [project-name]

# Install dependencies from svelte_app 
npm install

# Launch
npm run dev                 # Web app dev (SvelteKit)
npm run tauri dev           # Desktop app dev (Tauri via npm)
```

## Sidecar Service
```bash
# From svelte_app/sidecar-app
tsc
npm run sidecar:build 
npm run sidecar:prepare
```

## Project Structure

```
├── svelte_app/
│   ├── src-tauri/    # Desktop shell + native bridge
│   ├── src/          # Browser-based UI code
│   ├── sidecar-app/  # Node-based replay watcher
│   └── .env          # Shared configuration 
```

## Configuration
**Tauri Config:** `svelte_app/src-tauri/tauri.conf.json`

**Environment Variables:** `svelte_app/src/.env` 
```
.env
APP_VERSION=0.1.1_sample_version
APTABASE_KEY=sample_key
```