// CritIQ - Screenshot capture and annotation tool
// Tauri 2 backend

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod capture;
mod notes;
mod speech;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Screen capture
            capture::get_screens,
            capture::capture_screen,
            capture::capture_screen_fast,
            capture::multi::capture_all_screens,
            capture::multi::capture_all_screens_fast,
            capture::capture_region,
            // Notes and export
            notes::save::save_annotated_image,
            notes::save::format_for_ai,
            notes::export::export_session,
            // Speech recognition
            speech::check_speech_available,
            speech::start_speech_recognition,
            speech::stop_speech_recognition,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
