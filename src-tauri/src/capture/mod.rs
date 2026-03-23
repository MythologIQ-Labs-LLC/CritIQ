// Screen capture module — Types and single-screen commands

pub mod multi;
pub mod util;

use base64::{engine::general_purpose::STANDARD, Engine};
use screenshots::{image::ImageFormat, image::codecs::jpeg::JpegEncoder, image::ImageEncoder, Screen};
use serde::{Deserialize, Serialize};
use std::io::Cursor;

pub use multi::{capture_all_screens, capture_all_screens_fast};

#[derive(Debug, Serialize, Deserialize)]
pub struct CaptureResult {
    pub image: String,      // Base64 encoded image
    pub width: u32,
    pub height: u32,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CaptureError {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScreenInfo {
    pub id: u32,
    pub name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_primary: bool,
}

#[derive(Debug, Deserialize)]
pub struct RegionOptions {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

/// Get list of available screens
#[tauri::command]
pub async fn get_screens() -> Result<Vec<ScreenInfo>, CaptureError> {
    let screens = Screen::all().map_err(|e| CaptureError {
        message: format!("Failed to get screens: {}", e),
    })?;

    let screen_infos: Vec<ScreenInfo> = screens
        .iter()
        .enumerate()
        .map(|(idx, screen)| {
            let info = screen.display_info;
            ScreenInfo {
                id: info.id,
                name: format!("Display {} ({}x{})", idx + 1, info.width, info.height),
                x: info.x,
                y: info.y,
                width: info.width,
                height: info.height,
                is_primary: info.is_primary,
            }
        })
        .collect();

    Ok(screen_infos)
}

/// Captures a specific screen by index
#[tauri::command]
pub async fn capture_screen(screen_index: Option<usize>) -> Result<CaptureResult, CaptureError> {
    capture_screen_internal(screen_index, false).await
}

/// Fast capture for region selection (uses JPEG)
#[tauri::command]
pub async fn capture_screen_fast(screen_index: Option<usize>) -> Result<CaptureResult, CaptureError> {
    capture_screen_internal(screen_index, true).await
}

async fn capture_screen_internal(screen_index: Option<usize>, fast_mode: bool) -> Result<CaptureResult, CaptureError> {
    let screens = Screen::all().map_err(|e| CaptureError {
        message: format!("Failed to get screens: {}", e),
    })?;

    let index = screen_index.unwrap_or(0);
    let screen = screens.get(index).ok_or_else(|| CaptureError {
        message: format!("Screen {} not available", index),
    })?;

    let image = screen.capture().map_err(|e| CaptureError {
        message: format!("Failed to capture screen: {}", e),
    })?;

    let width = image.width();
    let height = image.height();

    if fast_mode {
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
            timestamp: util::get_iso_timestamp(),
        })
    } else {
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
            timestamp: util::get_iso_timestamp(),
        })
    }
}

/// Captures a specific region of the screen
#[tauri::command]
pub async fn capture_region(options: RegionOptions) -> Result<CaptureResult, CaptureError> {
    let screens = Screen::all().map_err(|e| CaptureError {
        message: format!("Failed to get screens: {}", e),
    })?;

    let screen = screens.first().ok_or_else(|| CaptureError {
        message: "No screens available".to_string(),
    })?;

    let image = screen
        .capture_area(options.x, options.y, options.width, options.height)
        .map_err(|e| CaptureError {
            message: format!("Failed to capture region: {}", e),
        })?;

    let width = image.width();
    let height = image.height();

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
        timestamp: util::get_iso_timestamp(),
    })
}
