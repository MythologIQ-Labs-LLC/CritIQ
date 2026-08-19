// Notes module — Annotation and storyboard export handling

mod archive;
mod bundle;
pub mod export;
pub mod save;
mod types;
pub mod util;

pub use types::{
    AIFormattedData, AnnotatedData, CaptureExport, ExportResult, Note, SaveError, SaveResult,
};

pub use export::export_session;
pub use save::{format_for_ai, save_annotated_image};
