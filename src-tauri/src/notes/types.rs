// Notes module — Type definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub text: String,
    pub timestamp: String,
    #[serde(rename = "type")]
    pub note_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnnotatedData {
    pub image: String,
    pub notes: Vec<Note>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveResult {
    pub image_path: String,
    pub notes_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveError {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIFormattedData {
    #[serde(rename = "type")]
    pub data_type: String,
    pub timestamp: String,
    pub image_data: Option<String>,
    pub notes: Vec<Note>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CaptureExport {
    pub id: String,
    pub image: String,
    pub notes: Vec<Note>,
    pub timestamp: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub path: String,
    pub format: String,
    pub count: usize,
}
