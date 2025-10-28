# ZKO_20XX

A cross-platform desktop app built for Super Smash Bros. Melee data visualization and analysis using Tauri, Rust, Node, and Svelte. 


## Quick Setup
```bash
# Clone the repository
git clone [repo-url]
cd [project-name]

# Install dependencies (per project)
cd node_server && npm install
cd ../svelte_app && npm install
```
**Launch from separate terminals:**
```
cd node_server && npm run dev                # Node server (required for file updates)

# Choose one (web frontend vs desktop):
cd svelte_app && npm run dev                 # Web app dev (SvelteKit)
cd svelte_app && npm run tauri dev           # Desktop app dev (Tauri via npm)
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

## Sidecar Build Process

Package node server as Tauri sidecar

```bash
# Run in order from svelte_app/sidecar-app
tsc
npm run sidecar:build 
npm run sidecar:prepare
```



