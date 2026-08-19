// Notes module - Save operations

use super::types::{AIFormattedData, AnnotatedData, Note, SaveError, SaveResult};
use super::util::{get_iso_timestamp, strip_base64_prefix};
use base64::Engine;
use std::fs;
use std::path::{Component, PathBuf};

fn validate_output_path(output_dir: &str) -> Result<PathBuf, SaveError> {
    let pictures_dir = dirs::picture_dir().ok_or_else(|| SaveError {
        message: "Could not determine Pictures directory".to_string(),
    })?;

    if output_dir.trim().is_empty() {
        return Ok(pictures_dir.join("CritIQ").join("Saved"));
    }

    let requested = PathBuf::from(output_dir);
    if !requested.is_absolute() {
        return Err(SaveError {
            message: "Output path must be absolute".to_string(),
        });
    }

    if requested
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        return Err(SaveError {
            message: "Path traversal not allowed".to_string(),
        });
    }

    if !requested.starts_with(&pictures_dir) {
        return Err(SaveError {
            message: format!("Invalid path: must be within {}", pictures_dir.display()),
        });
    }

    Ok(requested)
}

#[tauri::command]
pub async fn save_annotated_image(
    data: AnnotatedData,
    output_dir: String,
) -> Result<SaveResult, SaveError> {
    let safe_path = validate_output_path(&output_dir)?;
    fs::create_dir_all(&safe_path).map_err(|error| SaveError {
        message: format!("Failed to create directory: {}", error),
    })?;

    let timestamp = get_iso_timestamp();
    let file_timestamp = timestamp
        .replace([':', '-'], "")
        .replace('.', "_")
        .trim_end_matches('Z')
        .to_string();
    let extension = image_extension(&data.image);

    let image_path = safe_path.join(format!("critiq_{}.{}", file_timestamp, extension));
    let decoded = decode_image(&data.image)?;
    fs::write(&image_path, decoded).map_err(|error| SaveError {
        message: format!("Failed to write image: {}", error),
    })?;

    let notes_path = safe_path.join(format!("critiq_{}_notes.json", file_timestamp));
    let sidecar = serde_json::json!({
        "notes": data.notes,
        "annotations": data.annotations,
        "metadata": data.metadata,
        "timestamp": timestamp,
        "image": image_path.file_name().map(|name| name.to_string_lossy().to_string()),
    });

    let json = serde_json::to_string_pretty(&sidecar).map_err(|error| SaveError {
        message: format!("Failed to serialize notes: {}", error),
    })?;
    fs::write(&notes_path, json).map_err(|error| SaveError {
        message: format!("Failed to write notes: {}", error),
    })?;

    Ok(SaveResult {
        image_path: image_path.to_string_lossy().to_string(),
        notes_path: notes_path.to_string_lossy().to_string(),
    })
}

fn decode_image(image: &str) -> Result<Vec<u8>, SaveError> {
    base64::engine::general_purpose::STANDARD
        .decode(strip_base64_prefix(image))
        .map_err(|error| SaveError {
            message: format!("Failed to decode image: {}", error),
        })
}

pub(crate) fn image_extension(image: &str) -> &'static str {
    if image.starts_with("data:image/jpeg") || image.starts_with("data:image/jpg") {
        "jpg"
    } else {
        "png"
    }
}

#[tauri::command]
pub fn format_for_ai(data: AnnotatedData) -> AIFormattedData {
    let timestamp = get_iso_timestamp();
    let notes = normalize_notes(&data.notes, &timestamp);

    AIFormattedData {
        data_type: "annotated_screenshot".to_string(),
        timestamp,
        image_data: (!data.image.is_empty()).then_some(data.image),
        notes,
        annotations: data.annotations,
        metadata: data.metadata,
    }
}

fn normalize_notes(notes: &[Note], timestamp: &str) -> Vec<Note> {
    notes
        .iter()
        .map(|note| Note {
            text: note.text.clone(),
            timestamp: if note.timestamp.is_empty() {
                timestamp.to_string()
            } else {
                note.timestamp.clone()
            },
            note_type: if note.note_type.is_empty() {
                "text".to_string()
            } else {
                note.note_type.clone()
            },
            annotation_id: note.annotation_id.clone(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::image_extension;

    #[test]
    fn infers_frame_extension_from_data_url() {
        assert_eq!(image_extension("data:image/png;base64,abc"), "png");
        assert_eq!(image_extension("data:image/jpeg;base64,abc"), "jpg");
    }
}
