use super::types::{CaptureExport, SaveError};
use super::util::{get_iso_timestamp, strip_base64_prefix};
use base64::Engine;
use std::fs;
use std::path::Path;

pub fn write_bundle(
    captures: &[CaptureExport],
    export_dir: &Path,
    session_id: &str,
    created_at: &str,
) -> Result<(), SaveError> {
    let frames_dir = export_dir.join("frames");
    fs::create_dir_all(&frames_dir).map_err(save_error("create frames directory"))?;

    for (index, capture) in captures.iter().enumerate() {
        write_frame(capture, index, &frames_dir)?;
    }

    write_manifest(captures, export_dir, session_id, created_at)?;
    write_storyboard(captures, export_dir, session_id, created_at)?;
    Ok(())
}

fn write_frame(capture: &CaptureExport, index: usize, frames_dir: &Path) -> Result<(), SaveError> {
    let image_data = strip_base64_prefix(&capture.image);
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(image_data)
        .map_err(|error| SaveError {
            message: format!("Failed to decode frame {}: {}", index + 1, error),
        })?;

    let path = frames_dir.join(format!("{:03}.png", index + 1));
    fs::write(path, decoded).map_err(save_error("write storyboard frame"))
}

fn write_manifest(
    captures: &[CaptureExport],
    export_dir: &Path,
    session_id: &str,
    created_at: &str,
) -> Result<(), SaveError> {
    let frames = captures
        .iter()
        .enumerate()
        .map(|(index, capture)| {
            serde_json::json!({
                "sequence": index + 1,
                "id": &capture.id,
                "timestamp": &capture.timestamp,
                "image": format!("frames/{:03}.png", index + 1),
                "notes": &capture.notes,
                "metadata": capture.metadata.clone().unwrap_or_else(|| serde_json::json!({})),
            })
        })
        .collect::<Vec<_>>();

    let manifest = serde_json::json!({
        "schema": "critiq.storyboard/v1",
        "sessionId": session_id,
        "createdAt": created_at,
        "exportedAt": get_iso_timestamp(),
        "frames": frames,
    });

    let json = serde_json::to_string_pretty(&manifest).map_err(|error| SaveError {
        message: format!("Failed to serialize manifest: {}", error),
    })?;
    fs::write(export_dir.join("manifest.json"), json).map_err(save_error("write manifest"))
}

fn write_storyboard(
    captures: &[CaptureExport],
    export_dir: &Path,
    session_id: &str,
    created_at: &str,
) -> Result<(), SaveError> {
    let mut markdown = format!(
        "# CritIQ Storyboard\n\n**Session ID:** {}  \n**Created:** {}  \n**Frames:** {}\n\n",
        session_id,
        created_at,
        captures.len()
    );

    for (index, capture) in captures.iter().enumerate() {
        markdown.push_str(&format!("## Frame {:02}\n\n", index + 1));
        markdown.push_str(&format!("![Frame {:02}](frames/{:03}.png)\n\n", index + 1, index + 1));
        markdown.push_str(&format!("**Timestamp:** {}\n\n", capture.timestamp));
        if !capture.notes.is_empty() {
            markdown.push_str("### Notes\n\n");
            for note in &capture.notes {
                markdown.push_str(&format!("- {}\n", note.text));
            }
            markdown.push('\n');
        }
    }

    fs::write(export_dir.join("storyboard.md"), markdown).map_err(save_error("write storyboard"))
}

fn save_error(action: &'static str) -> impl FnOnce(std::io::Error) -> SaveError {
    move |error| SaveError {
        message: format!("Failed to {}: {}", action, error),
    }
}

#[cfg(test)]
mod tests {
    use super::write_bundle;
    use crate::notes::{CaptureExport, Note};
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn writes_ordered_storyboard_bundle() {
        let dir = test_dir("bundle");
        let capture = CaptureExport {
            id: "frame-1".to_string(),
            image: "data:image/png;base64,cG5n".to_string(),
            notes: vec![Note {
                text: "Keep this state".to_string(),
                timestamp: "2026-08-19T10:00:01Z".to_string(),
                note_type: "text".to_string(),
            }],
            timestamp: "2026-08-19T10:00:00Z".to_string(),
            metadata: Some(serde_json::json!({ "screen": 1 })),
        };

        write_bundle(&[capture], &dir, "session-1", "2026-08-19T10:00:00Z").unwrap();

        let manifest = fs::read_to_string(dir.join("manifest.json")).unwrap();
        let storyboard = fs::read_to_string(dir.join("storyboard.md")).unwrap();
        assert!(dir.join("frames/001.png").exists());
        assert!(manifest.contains("critiq.storyboard/v1"));
        assert!(manifest.contains("frames/001.png"));
        assert!(storyboard.contains("Keep this state"));
        assert!(storyboard.contains("frames/001.png"));

        fs::remove_dir_all(dir).unwrap();
    }

    fn test_dir(label: &str) -> std::path::PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("critiq-{}-{}-{}", label, std::process::id(), nonce))
    }
}
