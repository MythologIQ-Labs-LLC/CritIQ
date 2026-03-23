// Speech recognition support for CritIQ
// Provides Windows Speech Recognition integration

use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};

static SPEECH_AVAILABLE: AtomicBool = AtomicBool::new(false);
static SPEECH_ACTIVE: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Serialize, Deserialize)]
pub struct SpeechError {
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SpeechResult {
    pub transcript: String,
    #[serde(rename = "isFinal")]
    pub is_final: bool,
}

/// Check if Windows Speech Recognition is available
#[tauri::command]
pub async fn check_speech_available() -> bool {
    // Check if Windows Speech Recognition is available
    // For now, we return false as the actual Windows Speech API
    // requires the windows crate with Media_SpeechRecognition feature
    //
    // To enable native speech:
    // 1. Add to Cargo.toml:
    //    [target.'cfg(windows)'.dependencies]
    //    windows = { version = "0.58", features = ["Media_SpeechRecognition"] }
    // 2. Implement the actual SpeechRecognizer integration

    #[cfg(target_os = "windows")]
    {
        // Windows 10+ has Speech APIs available
        // For now, return false until we implement actual Windows Speech integration
        // The frontend will fall back to Web Speech API
        SPEECH_AVAILABLE.store(false, Ordering::SeqCst);
        false
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

/// Start speech recognition
/// Emits 'speech-result' events with transcription results
#[tauri::command]
pub async fn start_speech_recognition(_app: tauri::AppHandle) -> Result<(), SpeechError> {
    if !SPEECH_AVAILABLE.load(Ordering::SeqCst) {
        return Err(SpeechError {
            message: "Windows Speech Recognition not available".to_string(),
        });
    }

    if SPEECH_ACTIVE.load(Ordering::SeqCst) {
        return Err(SpeechError {
            message: "Speech recognition already active".to_string(),
        });
    }

    SPEECH_ACTIVE.store(true, Ordering::SeqCst);

    // TODO: Implement actual Windows Speech Recognition
    // This would use the windows crate:
    //
    // use windows::Media::SpeechRecognition::*;
    //
    // let recognizer = SpeechRecognizer::CreateWithLanguage(language)?;
    // let session = recognizer.ContinuousRecognitionSession()?;
    //
    // session.ResultGenerated(TypedEventHandler::new(move |_, args| {
    //     if let Ok(result) = args.Result() {
    //         let text = result.Text()?.to_string();
    //         app.emit("speech-result", SpeechResult {
    //             transcript: text,
    //             is_final: true,
    //         });
    //     }
    //     Ok(())
    // }))?;
    //
    // session.StartAsync()?.await?;

    // For now, return success but rely on Web Speech in the frontend
    Ok(())
}

/// Stop speech recognition
#[tauri::command]
pub async fn stop_speech_recognition() -> Result<(), SpeechError> {
    if !SPEECH_ACTIVE.load(Ordering::SeqCst) {
        return Ok(()); // Already stopped
    }

    SPEECH_ACTIVE.store(false, Ordering::SeqCst);

    // TODO: Stop the actual Windows Speech Recognition session
    // session.StopAsync()?.await?;

    Ok(())
}
