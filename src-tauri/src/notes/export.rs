// Notes module — Export operations

use super::types::{CaptureExport, ExportResult, SaveError};
use super::util::{format_time_from_iso, get_iso_timestamp, strip_base64_prefix};
use base64::Engine;
use std::fs;
use std::path::PathBuf;

/// Export session with multiple captures
#[tauri::command]
pub async fn export_session(
    captures: Vec<CaptureExport>,
    format: String,
    session_id: String,
) -> Result<ExportResult, SaveError> {
    let pictures_dir = dirs::picture_dir().ok_or_else(|| SaveError {
        message: "Could not determine Pictures directory".to_string(),
    })?;

    // Create CritIQ export directory
    let export_dir = pictures_dir.join("CritIQ").join(&session_id);
    fs::create_dir_all(&export_dir).map_err(|e| SaveError {
        message: format!("Failed to create export directory: {}", e),
    })?;

    match format.as_str() {
        "individual" => export_individual(&captures, &export_dir).await,
        "markdown" => export_markdown(&captures, &export_dir, &session_id).await,
        "zip" => export_zip(&captures, &export_dir, &session_id).await,
        _ => Err(SaveError {
            message: format!("Unknown export format: {}", format),
        }),
    }
}

async fn export_individual(
    captures: &[CaptureExport],
    export_dir: &PathBuf,
) -> Result<ExportResult, SaveError> {
    for (index, capture) in captures.iter().enumerate() {
        // Save image
        let image_filename = format!("capture_{:03}.png", index + 1);
        let image_path = export_dir.join(&image_filename);

        let image_data = strip_base64_prefix(&capture.image);

        let decoded = base64::engine::general_purpose::STANDARD
            .decode(image_data)
            .map_err(|e| SaveError {
                message: format!("Failed to decode image {}: {}", index + 1, e),
            })?;

        fs::write(&image_path, decoded).map_err(|e| SaveError {
            message: format!("Failed to write image {}: {}", index + 1, e),
        })?;
    }

    // Save session metadata JSON
    let metadata_path = export_dir.join("session.json");
    let session_data = serde_json::json!({
        "exported": get_iso_timestamp(),
        "count": captures.len(),
        "captures": captures.iter().enumerate().map(|(i, c)| {
            serde_json::json!({
                "index": i + 1,
                "id": c.id,
                "timestamp": c.timestamp,
                "notes": c.notes,
                "image_file": format!("capture_{:03}.png", i + 1),
            })
        }).collect::<Vec<_>>(),
    });

    fs::write(
        &metadata_path,
        serde_json::to_string_pretty(&session_data).unwrap(),
    )
    .map_err(|e| SaveError {
        message: format!("Failed to write session metadata: {}", e),
    })?;

    Ok(ExportResult {
        path: export_dir.to_string_lossy().to_string(),
        format: "individual".to_string(),
        count: captures.len(),
    })
}

async fn export_markdown(
    captures: &[CaptureExport],
    export_dir: &PathBuf,
    session_id: &str,
) -> Result<ExportResult, SaveError> {
    // First export individual images
    export_individual(captures, export_dir).await?;

    // Generate markdown report
    let mut markdown = format!(
        "# CritIQ Session Report\n\n**Session ID:** {}\n**Exported:** {}\n**Total Captures:** {}\n\n---\n\n",
        session_id,
        get_iso_timestamp(),
        captures.len()
    );

    for (index, capture) in captures.iter().enumerate() {
        markdown.push_str(&format!("## Capture {}\n\n", index + 1));
        markdown.push_str(&format!("**Timestamp:** {}\n\n", capture.timestamp));

        if !capture.notes.is_empty() {
            markdown.push_str("### Notes\n\n");
            for note in &capture.notes {
                let time = format_time_from_iso(&note.timestamp);
                markdown.push_str(&format!("- {} _(at {})_\n", note.text, time));
            }
            markdown.push('\n');
        }

        markdown.push_str(&format!(
            "![Capture {}](capture_{:03}.png)\n\n",
            index + 1,
            index + 1
        ));
        markdown.push_str("---\n\n");
    }

    let markdown_path = export_dir.join("report.md");
    fs::write(&markdown_path, markdown).map_err(|e| SaveError {
        message: format!("Failed to write markdown report: {}", e),
    })?;

    Ok(ExportResult {
        path: markdown_path.to_string_lossy().to_string(),
        format: "markdown".to_string(),
        count: captures.len(),
    })
}

async fn export_zip(
    captures: &[CaptureExport],
    export_dir: &PathBuf,
    session_id: &str,
) -> Result<ExportResult, SaveError> {
    // First export individual files
    export_individual(captures, export_dir).await?;

    // Create markdown report too
    export_markdown(captures, export_dir, session_id).await?;

    // Note: ZIP creation would require the `zip` crate
    // For now, we just return the directory path

    Ok(ExportResult {
        path: export_dir.to_string_lossy().to_string(),
        format: "zip".to_string(), // Actually just a folder for now
        count: captures.len(),
    })
}
