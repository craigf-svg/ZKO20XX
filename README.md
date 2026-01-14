# ZKO_20XX
![Tauri](https://img.shields.io/badge/Tauri-273849?style=for-the-badge&logo=tauri&logoColor=64b5f6)
![Svelte](https://img.shields.io/badge/Svelte-273849?style=for-the-badge&logo=svelte&logoColor=64b5f6)
![HTML5](https://img.shields.io/badge/HTML5-273849?style=for-the-badge&logo=html5&logoColor=64b5f6)
![CSS3](https://img.shields.io/badge/CSS3-273849?style=for-the-badge&logo=css&logoColor=64b5f6)
![JavaScript](https://img.shields.io/badge/JavaScript-273849?style=for-the-badge&logo=javascript&logoColor=64b5f6)
![Rust](https://img.shields.io/badge/Rust-273849?style=for-the-badge&logo=rust&logoColor=64b5f6)
![Node.js](https://img.shields.io/badge/Node.js-273849?style=for-the-badge&logo=node.js&logoColor=64b5f6)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-273849?style=for-the-badge&logo=githubactions&logoColor=64b5f6)

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
