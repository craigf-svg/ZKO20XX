use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MoveCatalogEntry {
    pub label: String,
    pub short_label: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StageEntry {
    pub stage: String,
    pub moves: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MatchupFile {
    pub character: String,
    pub opponent: String,
    pub move_catalog: HashMap<String, MoveCatalogEntry>,
    pub stages: Vec<StageEntry>,
}

#[derive(Debug, Serialize)]
pub struct MatchupListEntry {
    pub character: String,
    pub opponent: String,
}

fn matchup_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    Ok(app_data.join("matchup_data"))
}

fn matchup_file_path(app: &tauri::AppHandle, character: &str, opponent: &str) -> Result<PathBuf, String> {
    let dir = matchup_data_dir(app)?;
    Ok(dir.join(character).join(format!("vs_{}.json", opponent)))
}

#[command]
pub async fn save_matchup_file(
    app: tauri::AppHandle,
    character: String,
    opponent: String,
    data: MatchupFile,
) -> Result<(), String> {
    let path = matchup_file_path(&app, &character, &opponent)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // Atomic write: write to temp file then rename
    let tmp_path = path.with_extension("json.tmp");
    let json = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    fs::write(&tmp_path, &json)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    fs::rename(&tmp_path, &path)
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;

    Ok(())
}

#[command]
pub async fn load_matchup_file(
    app: tauri::AppHandle,
    character: String,
    opponent: String,
) -> Result<MatchupFile, String> {
    let path = matchup_file_path(&app, &character, &opponent)?;

    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))?;

    let data: MatchupFile = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse {}: {}", path.display(), e))?;

    Ok(data)
}

#[command]
pub async fn list_matchups(app: tauri::AppHandle) -> Result<Vec<MatchupListEntry>, String> {
    let dir = matchup_data_dir(&app)?;
    let mut entries = Vec::new();

    if !dir.exists() {
        return Ok(entries);
    }

    let char_dirs = fs::read_dir(&dir)
        .map_err(|e| format!("Failed to read matchup_data dir: {}", e))?;

    for char_entry in char_dirs {
        let char_entry = char_entry.map_err(|e| e.to_string())?;
        let char_path = char_entry.path();
        if !char_path.is_dir() {
            continue;
        }

        let character = char_entry
            .file_name()
            .to_string_lossy()
            .to_string();

        let files = fs::read_dir(&char_path)
            .map_err(|e| format!("Failed to read dir {}: {}", char_path.display(), e))?;

        for file_entry in files {
            let file_entry = file_entry.map_err(|e| e.to_string())?;
            let file_name = file_entry.file_name().to_string_lossy().to_string();

            if file_name.starts_with("vs_") && file_name.ends_with(".json") {
                let opponent = file_name
                    .strip_prefix("vs_")
                    .unwrap()
                    .strip_suffix(".json")
                    .unwrap()
                    .to_string();

                entries.push(MatchupListEntry {
                    character: character.clone(),
                    opponent,
                });
            }
        }
    }

    Ok(entries)
}
