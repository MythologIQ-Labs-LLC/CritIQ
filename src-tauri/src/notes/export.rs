use super::archive;
use super::bundle;
use super::types::{CaptureExport, ExportResult, SaveError};
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn export_session(
    captures: Vec<CaptureExport>,
    format: String,
    session_id: String,
    created_at: String,
) -> Result<ExportResult, SaveError> {
    validate_format(&format)?;

    let pictures_dir = dirs::picture_dir().ok_or_else(|| SaveError {
        message: "Could not determine Pictures directory".to_string(),
    })?;
    let root = pictures_dir.join("CritIQ");
    fs::create_dir_all(&root).map_err(|error| SaveError {
        message: format!("Failed to create CritIQ export directory: {}", error),
    })?;

    let safe_id = sanitize_session_id(&session_id);
    let export_dir = root.join(&safe_id);
    reset_export_dir(&export_dir)?;
    bundle::write_bundle(&captures, &export_dir, &session_id, &created_at)?;

    let path = match format.as_str() {
        "individual" => export_dir,
        "markdown" => export_dir.join("storyboard.md"),
        "zip" => {
            let archive_path = root.join(format!("critiq-session-{}.zip", safe_id));
            archive::write_zip(&export_dir, &archive_path)?;
            archive_path
        }
        _ => unreachable!(),
    };

    Ok(ExportResult {
        path: path.to_string_lossy().to_string(),
        format,
        count: captures.len(),
    })
}

fn validate_format(format: &str) -> Result<(), SaveError> {
    if matches!(format, "individual" | "markdown" | "zip") {
        return Ok(());
    }
    Err(SaveError {
        message: format!("Unknown export format: {}", format),
    })
}

fn reset_export_dir(export_dir: &PathBuf) -> Result<(), SaveError> {
    if export_dir.exists() {
        fs::remove_dir_all(export_dir).map_err(|error| SaveError {
            message: format!("Failed to reset export directory: {}", error),
        })?;
    }
    fs::create_dir_all(export_dir).map_err(|error| SaveError {
        message: format!("Failed to create export directory: {}", error),
    })
}

fn sanitize_session_id(session_id: &str) -> String {
    let safe = session_id
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_') {
                ch
            } else {
                '_'
            }
        })
        .collect::<String>();

    if safe.is_empty() {
        "session".to_string()
    } else {
        safe
    }
}

#[cfg(test)]
mod tests {
    use super::sanitize_session_id;

    #[test]
    fn sanitizes_session_ids_for_filesystem_use() {
        assert_eq!(sanitize_session_id("abc-123_xyz"), "abc-123_xyz");
        assert_eq!(sanitize_session_id("../escape"), "___escape");
        assert_eq!(sanitize_session_id(""), "session");
    }
}
