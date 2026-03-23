// Capture module — Multi-screen capture commands

use super::{CaptureError, CaptureResult};
use super::util::get_iso_timestamp;
use base64::{engine::general_purpose::STANDARD, Engine};
use screenshots::{image::ImageFormat, image::codecs::jpeg::JpegEncoder, image::ImageEncoder, Screen};
use std::io::Cursor;

/// Captures all screens stitched together (full quality PNG)
#[tauri::command]
pub async fn capture_all_screens() -> Result<CaptureResult, CaptureError> {
    capture_all_screens_internal(false).await
}

/// Fast capture for region selection overlay (uses JPEG)
#[tauri::command]
pub async fn capture_all_screens_fast() -> Result<CaptureResult, CaptureError> {
    capture_all_screens_internal(true).await
}

async fn capture_all_screens_internal(fast_mode: bool) -> Result<CaptureResult, CaptureError> {
    let screens = Screen::all().map_err(|e| CaptureError {
        message: format!("Failed to get screens: {}", e),
    })?;

    if screens.is_empty() {
        return Err(CaptureError {
            message: "No screens available".to_string(),
        });
    }

    // Calculate total bounds across all screens
    let mut min_x = i32::MAX;
    let mut min_y = i32::MAX;
    let mut max_x = i32::MIN;
    let mut max_y = i32::MIN;

    for screen in &screens {
        let info = screen.display_info;
        min_x = min_x.min(info.x);
        min_y = min_y.min(info.y);
        max_x = max_x.max(info.x + info.width as i32);
        max_y = max_y.max(info.y + info.height as i32);
    }

    let total_width = (max_x - min_x) as u32;
    let total_height = (max_y - min_y) as u32;

    // Create combined image
    let mut combined = screenshots::image::RgbaImage::new(total_width, total_height);

    // Capture each screen and place it in the combined image
    for screen in &screens {
        let info = screen.display_info;
        let capture = screen.capture().map_err(|e| CaptureError {
            message: format!("Failed to capture screen {}: {}", info.id, e),
        })?;

        let offset_x = (info.x - min_x) as u32;
        let offset_y = (info.y - min_y) as u32;

        screenshots::image::imageops::overlay(&mut combined, &capture, offset_x as i64, offset_y as i64);
    }

    // Encode based on mode
    if fast_mode {
        encode_jpeg(combined, total_width, total_height)
    } else {
        encode_png(combined, total_width, total_height)
    }
}

fn encode_jpeg(image: screenshots::image::RgbaImage, width: u32, height: u32) -> Result<CaptureResult, CaptureError> {
    let rgb_image = screenshots::image::DynamicImage::ImageRgba8(image).to_rgb8();
    let mut jpeg_data = Vec::new();
    let encoder = JpegEncoder::new_with_quality(&mut jpeg_data, 85);
    encoder
        .write_image(&rgb_image, width, height, screenshots::image::ColorType::Rgb8)
        .map_err(|e| CaptureError {
            message: format!("Failed to encode image: {}", e),
        })?;

    Ok(CaptureResult {
        image: format!("data:image/jpeg;base64,{}", STANDARD.encode(&jpeg_data)),
        width,
        height,
        timestamp: get_iso_timestamp(),
    })
}

fn encode_png(image: screenshots::image::RgbaImage, width: u32, height: u32) -> Result<CaptureResult, CaptureError> {
    let mut png_data = Cursor::new(Vec::new());
    image
        .write_to(&mut png_data, ImageFormat::Png)
        .map_err(|e| CaptureError {
            message: format!("Failed to encode image: {}", e),
        })?;

    Ok(CaptureResult {
        image: format!("data:image/png;base64,{}", STANDARD.encode(png_data.into_inner())),
        width,
        height,
        timestamp: get_iso_timestamp(),
    })
}
