// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_aptabase::EventTracker;
mod system_info;
mod version;
use system_info::get_cpu_usage;

#[tokio::main]
async fn main() {
    let app_version = version::get_app_version();
    println!("app_version={}", app_version);

    let cpu_usage = get_cpu_usage();
    println!("cpu_usage is {}", cpu_usage);

    let aptabase_key = std::env::var("APTABASE_KEY").ok();
    let aptabase_enabled = aptabase_key.is_some();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_cpu_usage])
        .plugin(tauri_plugin_store::Builder::new().build());

    if let Some(ref key) = aptabase_key {
        builder = builder.plugin(tauri_plugin_aptabase::Builder::new(key).build());
    } else {
        println!("APTABASE_KEY not set; Aptabase analytics disabled.");
    }

    builder
        .setup(move |app| {
            if aptabase_enabled {
                let _ = app.track_event(
                    "app_test",
                    None,
            );
            }
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
        .run(move |app_handle, event| match event {
            tauri::RunEvent::Exit { .. } => {
                if aptabase_enabled {
                    let _ = app_handle.track_event("app_exited", None);
                    app_handle.flush_events_blocking();
                }
            }
            _ => {}
        });
}