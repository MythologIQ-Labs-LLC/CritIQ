use super::save::image_extension;
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
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(strip_base64_prefix(&capture.image))
        .map_err(|error| SaveError {
            message: format!("Failed to decode frame {}: {}", index + 1, error),
        })?;

    let filename = frame_filename(index, capture);
    fs::write(frames_dir.join(filename), decoded).map_err(save_error("write storyboard frame"))
}

fn frame_filename(index: usize, capture: &CaptureExport) -> String {
    format!("{:03}.{}", index + 1, image_extension(&capture.image))
}

fn frame_relative_path(index: usize, capture: &CaptureExport) -> String {
    format!("frames/{}", frame_filename(index, capture))
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
                "image": frame_relative_path(index, capture),
                "notes": &capture.notes,
                "annotations": &capture.annotations,
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
        let image_path = frame_relative_path(index, capture);
        markdown.push_str(&format!("## Frame {:02}\n\n", index + 1));
        markdown.push_str(&format!("![Frame {:02}]({})\n\n", index + 1, image_path));
        markdown.push_str(&format!("**Timestamp:** {}\n\n", capture.timestamp));
        markdown.push_str(&format!("**Annotations:** {}\n\n", capture.annotations.len()));
        append_notes(&mut markdown, capture);
    }

    fs::write(export_dir.join("storyboard.md"), markdown).map_err(save_error("write storyboard"))
}

fn append_notes(markdown: &mut String, capture: &CaptureExport) {
    if capture.notes.is_empty() {
        return;
    }

    markdown.push_str("### Notes\n\n");
    for note in &capture.notes {
        match &note.annotation_id {
            Some(id) => markdown.push_str(&format!("- {} _(annotation `{}`)_\n", note.text, id)),
            None => markdown.push_str(&format!("- {}\n", note.text)),
        }
    }
    markdown.push('\n');
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
    fn writes_annotations_and_linked_notes() {
        let dir = test_dir("bundle");
        let capture = CaptureExport {
            id: "frame-1".to_string(),
            image: "data:image/png;base64,cG5n".to_string(),
            notes: vec![Note {
                text: "Move this button".to_string(),
                timestamp: "2026-08-19T10:00:01Z".to_string(),
                note_type: "text".to_string(),
                annotation_id: Some("annotation-1".to_string()),
            }],
            annotations: vec![serde_json::json!({
                "id": "annotation-1",
                "type": "rect",
                "x1": 10,
                "y1": 20,
                "x2": 50,
                "y2": 60
            })],
            timestamp: "2026-08-19T10:00:00Z".to_string(),
            metadata: Some(serde_json::json!({ "screen": 1 })),
        };

        write_bundle(&[capture], &dir, "session-1", "2026-08-19T10:00:00Z").unwrap();

        let manifest = fs::read_to_string(dir.join("manifest.json")).unwrap();
        let storyboard = fs::read_to_string(dir.join("storyboard.md")).unwrap();
        assert!(dir.join("frames/001.png").exists());
        assert!(manifest.contains("critiq.storyboard/v1"));
        assert!(manifest.contains("annotation-1"));
        assert!(storyboard.contains("Move this button"));
        assert!(storyboard.contains("annotation `annotation-1`"));

        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn preserves_jpeg_extension() {
        let dir = test_dir("jpeg");
        let capture = CaptureExport {
            id: "frame-1".to_string(),
            image: "data:image/jpeg;base64,anBn".to_string(),
            notes: vec![],
            annotations: vec![],
            timestamp: "2026-08-19T10:00:00Z".to_string(),
            metadata: None,
        };

        write_bundle(&[capture], &dir, "session-2", "2026-08-19T10:00:00Z").unwrap();
        assert!(dir.join("frames/001.jpg").exists());
        fs::remove_dir_all(dir).unwrap();
    }

    fn test_dir(label: &str) -> std::path::PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!(
            "critiq-{}-{}-{}",
            label,
            std::process::id(),
            nonce
        ))
    }
}
