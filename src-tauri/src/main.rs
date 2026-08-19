// CritIQ - Screenshot capture and annotation tool
// Tauri 2 backend

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod capture;
mod notes;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            capture::get_screens,
            capture::capture_screen,
            capture::capture_screen_fast,
            capture::multi::capture_all_screens,
            capture::multi::capture_all_screens_fast,
            capture::capture_region,
            notes::save::save_annotated_image,
            notes::save::format_for_ai,
            notes::export::export_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
