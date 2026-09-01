#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let platform = match std::env::consts::OS {
                    "macos" => "macos",
                    "windows" => "windows",
                    _ => "linux",
                };
                let script = format!(
                    "document.documentElement.dataset.platform='{platform}';"
                );
                let _ = window.eval(&script);
            }

            #[cfg(not(debug_assertions))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let _ = check_for_updates(handle).await;
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Real Calendar");
}

#[cfg(not(debug_assertions))]
async fn check_for_updates(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        update
            .download_and_install(
                |chunk_length, content_length| {
                    let _ = (chunk_length, content_length);
                },
                || {},
            )
            .await?;
        app.request_restart();
    }
    Ok(())
}

fn main() {
    run();
}
