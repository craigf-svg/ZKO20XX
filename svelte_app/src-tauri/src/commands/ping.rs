use tauri::command;
use tauri_plugin_shell::ShellExt;

#[command]
pub async fn ping(app: tauri::AppHandle, message: String) -> String {
  let sidecar_command = app
    .shell()
    .sidecar("app")
    .unwrap()
    .arg("ping")
    .arg(message);
  let output = sidecar_command.output().await.unwrap();
  String::from_utf8(output.stdout).unwrap()
}