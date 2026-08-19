use super::types::SaveError;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipWriter};

pub fn write_zip(bundle_dir: &Path, archive_path: &Path) -> Result<(), SaveError> {
    let file = File::create(archive_path).map_err(io_error("create ZIP archive"))?;
    let mut archive = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);

    add_file(&mut archive, bundle_dir, "storyboard.md", options)?;
    add_file(&mut archive, bundle_dir, "manifest.json", options)?;

    let mut frames = fs::read_dir(bundle_dir.join("frames"))
        .map_err(io_error("read frames directory"))?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .collect::<Vec<_>>();
    frames.sort();

    for frame in frames {
        let name = frame
            .file_name()
            .and_then(|value| value.to_str())
            .ok_or_else(|| SaveError {
                message: "Invalid frame filename".to_string(),
            })?;
        add_file(&mut archive, bundle_dir, &format!("frames/{}", name), options)?;
    }

    archive.finish().map_err(zip_error("finish ZIP archive"))?;
    Ok(())
}

fn add_file(
    archive: &mut ZipWriter<File>,
    bundle_dir: &Path,
    name: &str,
    options: SimpleFileOptions,
) -> Result<(), SaveError> {
    let bytes = fs::read(bundle_dir.join(name)).map_err(io_error("read bundle file"))?;
    archive
        .start_file(name, options)
        .map_err(zip_error("start ZIP entry"))?;
    archive
        .write_all(&bytes)
        .map_err(io_error("write ZIP entry"))?;
    Ok(())
}

fn io_error(action: &'static str) -> impl FnOnce(std::io::Error) -> SaveError {
    move |error| SaveError {
        message: format!("Failed to {}: {}", action, error),
    }
}

fn zip_error(action: &'static str) -> impl FnOnce(zip::result::ZipError) -> SaveError {
    move |error| SaveError {
        message: format!("Failed to {}: {}", action, error),
    }
}
