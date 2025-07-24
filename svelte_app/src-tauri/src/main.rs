// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenvy_macro::dotenv;
use serde_json::json;
use tauri_plugin_aptabase::Builder as AptabaseBuilder;
use tauri_plugin_aptabase::EventTracker;
mod system_info;
mod version;
use system_info::get_cpu_usage;
mod commands;

#[tokio::main]
async fn main() {
    let app_version = version::get_app_version();
    println!("app_version={}", app_version);
    println!(".env APTABASE_KEY={}", dotenv!("APTABASE_KEY"));

    let cpu_usage = get_cpu_usage();
    println!("cpu_usage is {}", cpu_usage);

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![commands::ping::ping, get_cpu_usage])
        .plugin(tauri_plugin_aptabase::Builder::new(dotenv!("APTABASE_KEY")).build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(move |app| {
            app.track_event(
                "app_test",
                None, // If passing properties
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