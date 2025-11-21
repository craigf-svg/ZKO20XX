# ZKO_20XX
![Tauri](https://img.shields.io/badge/Tauri-D9A441?style=flat-square&logo=tauri&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-C14D36?style=flat-square&logo=svelte&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-2F8F6C?style=flat-square&logo=node.js&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-DD6F4D?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1D4E89?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-EFE38A?style=flat-square&logo=javascript&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-2B2B2B?style=flat-square&logo=rust&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-009688?style=flat-square)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-3B5998?style=flat-square&logo=githubactions&logoColor=white)

A cross-platform desktop app built for Super Smash Bros. Melee data visualization and analysis using Tauri, Rust, Node, and Svelte.

## Quick Setup
```bash
# Clone the repository
git clone [repo-url]
cd [project-name]

# Install dependencies at repo root
npm install

# Launch
npm run dev                 # Web app dev (SvelteKit)
npm run tauri dev           # Desktop app dev (Tauri via npm)
```

## Sidecar Service
```bash
# From sidecar-app/
tsc
npm run sidecar:build
npm run sidecar:prepare
```

## Project Structure

```
├── src-tauri/        # Desktop shell + native bridge
├── src/              # Browser-based UI code
└── sidecar-app/      # Node-based replay watcher
```

## Configuration
**Tauri Config:** `src-tauri/tauri.conf.json`

**Environment Variables:** `src/.env`
```
.env
APP_VERSION=0.1.1_sample_version
APTABASE_KEY=sample_key
```
