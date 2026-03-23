// Notes module — Save operations

use super::types::{AIFormattedData, AnnotatedData, Note, SaveError, SaveResult};
use super::util::{get_iso_timestamp, strip_base64_prefix};
use base64::Engine;
use std::fs;
use std::path::PathBuf;

/// Validates that the output path is within the Pictures directory
fn validate_output_path(output_dir: &str) -> Result<PathBuf, SaveError> {
    let pictures_dir = dirs::picture_dir().ok_or_else(|| SaveError {
        message: "Could not determine Pictures directory".to_string(),
    })?;

    let requested_path = PathBuf::from(output_dir);
    let canonical_path = requested_path.canonicalize().unwrap_or(requested_path.clone());

    // Security: Ensure path is within Pictures directory
    if !canonical_path.starts_with(&pictures_dir) {
        return Err(SaveError {
            message: format!(
                "Invalid path: must be within {}",
                pictures_dir.display()
            ),
        });
    }

    // Reject path traversal attempts
    if output_dir.contains("..") {
        return Err(SaveError {
            message: "Path traversal not allowed".to_string(),
        });
    }

    Ok(canonical_path)
}

/// Saves annotated image and notes to disk
#[tauri::command]
pub async fn save_annotated_image(
    data: AnnotatedData,
    output_dir: String,
) -> Result<SaveResult, SaveError> {
    let safe_path = validate_output_path(&output_dir)?;

    // Create output directory if it doesn't exist
    fs::create_dir_all(&safe_path).map_err(|e| SaveError {
        message: format!("Failed to create directory: {}", e),
    })?;

    let timestamp = get_iso_timestamp();
    let file_timestamp = timestamp.replace([':', '-'], "").replace('.', "_")[..15].to_string();

    // Save image (strip data URL prefix if present)
    let image_filename = format!("critiq_{}.png", file_timestamp);
    let image_path = safe_path.join(&image_filename);

    let image_data = strip_base64_prefix(&data.image);

    let decoded = base64::engine::general_purpose::STANDARD
        .decode(image_data)
        .map_err(|e| SaveError {
            message: format!("Failed to decode image: {}", e),
        })?;

    fs::write(&image_path, decoded).map_err(|e| SaveError {
        message: format!("Failed to write image: {}", e),
    })?;

    // Save notes as JSON
    let notes_filename = format!("critiq_{}_notes.json", file_timestamp);
    let notes_path = safe_path.join(&notes_filename);

    let notes_json = serde_json::json!({
        "notes": data.notes,
        "metadata": data.metadata,
        "timestamp": timestamp,
    });

    fs::write(&notes_path, serde_json::to_string_pretty(&notes_json).unwrap()).map_err(|e| {
        SaveError {
            message: format!("Failed to write notes: {}", e),
        }
    })?;

    Ok(SaveResult {
        image_path: image_path.to_string_lossy().to_string(),
        notes_path: notes_path.to_string_lossy().to_string(),
    })
}

/// Formats annotated data for AI consumption
#[tauri::command]
pub fn format_for_ai(data: AnnotatedData) -> AIFormattedData {
    let timestamp = get_iso_timestamp();

    let notes: Vec<Note> = data
        .notes
        .iter()
        .map(|note| Note {
            text: note.text.clone(),
            timestamp: if note.timestamp.is_empty() {
                timestamp.clone()
            } else {
                note.timestamp.clone()
            },
            note_type: if note.note_type.is_empty() {
                "text".to_string()
            } else {
                note.note_type.clone()
            },
        })
        .collect();

    AIFormattedData {
        data_type: "annotated_screenshot".to_string(),
        timestamp,
        image_data: if data.image.is_empty() {
            None
        } else {
            Some(data.image)
        },
        notes,
        metadata: data.metadata,
    }
}
