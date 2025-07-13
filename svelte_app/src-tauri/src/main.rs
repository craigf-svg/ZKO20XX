// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_aptabase::EventTracker;
use tauri_plugin_aptabase::Builder as AptabaseBuilder;
use dotenvy_macro::dotenv;
use serde_json::json;
mod version;

#[tokio::main]
async fn main() {
    let app_version = version::get_app_version();
    println!("app_version={}", app_version);
    println!(".env APTABASE_KEY={}", dotenv!("APTABASE_KEY"));

    tauri::Builder::default()
        .plugin(
          tauri_plugin_aptabase::Builder::new(dotenv!("APTABASE_KEY")).build()
        )
        .setup(move |app| {
            app.track_event(
                "app_test",
                None
                // If passing properties
                // Some(json!({ "test_value": "Testing"}))
              );
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::Exit { .. } => {
                app_handle.track_event("app_exited", None);
                app_handle.flush_events_blocking();
            }
            _ => {}
        });
}
