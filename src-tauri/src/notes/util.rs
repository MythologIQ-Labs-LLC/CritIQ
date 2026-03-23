// Notes module — Utility functions (replaces chrono dependency)

use std::time::{SystemTime, UNIX_EPOCH};

/// Generate ISO 8601 timestamp using std::time (no chrono dependency)
pub fn get_iso_timestamp() -> String {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();

    let secs = duration.as_secs();
    let millis = duration.subsec_millis();

    // Calculate date/time components
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    // Calculate year, month, day from days since epoch
    let (year, month, day) = days_to_ymd(days as i64 + 719468); // Adjust for Unix epoch

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}.{:03}Z",
        year, month, day, hours, minutes, seconds, millis
    )
}

/// Convert days since epoch to year/month/day
fn days_to_ymd(days: i64) -> (i32, u32, u32) {
    // Algorithm from: http://howardhinnant.github.io/date_algorithms.html
    let era = if days >= 0 { days } else { days - 146096 } / 146097;
    let doe = (days - era * 146097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y as i32, m, d)
}

/// Extract time portion from ISO timestamp string
pub fn format_time_from_iso(iso_str: &str) -> String {
    // Parse HH:MM:SS from ISO format like "2024-01-15T14:30:45.123Z"
    if let Some(t_pos) = iso_str.find('T') {
        let time_part = &iso_str[t_pos + 1..];
        if time_part.len() >= 8 {
            return time_part[..8].to_string();
        }
    }
    iso_str.to_string()
}

/// Strip base64 data URL prefix from image string
pub fn strip_base64_prefix(data: &str) -> &str {
    if data.starts_with("data:image/png;base64,") {
        &data["data:image/png;base64,".len()..]
    } else if data.starts_with("data:image/jpeg;base64,") {
        &data["data:image/jpeg;base64,".len()..]
    } else {
        data
    }
}
