// Notes module — Annotation and export handling

pub mod export;
pub mod save;
mod types;
pub mod util;

// Re-export public types
pub use types::{
    AIFormattedData, AnnotatedData, CaptureExport, ExportResult, Note, SaveError, SaveResult,
};

// Re-export Tauri commands
pub use export::export_session;
pub use save::{format_for_ai, save_annotated_image};
