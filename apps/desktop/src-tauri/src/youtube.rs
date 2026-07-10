use std::time::Duration;

const YOUTUBE_USER_AGENT: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

#[tauri::command]
pub fn resolve_youtube_handle(handle: String) -> Result<String, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {e}"))?;

    let clean = handle.trim_start_matches('@');
    let url = format!("https://www.youtube.com/@{clean}");
    let resp = client
        .get(&url)
        .header("User-Agent", YOUTUBE_USER_AGENT)
        .header("Accept", "text/html,application/xhtml+xml")
        .send()
        .map_err(|e| format!("Failed to fetch YouTube page: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("YouTube returned HTTP {}", resp.status().as_u16()));
    }

    let html = resp
        .text()
        .map_err(|e| format!("Failed to read response: {e}"))?;

    // Strategy 1: Look for RSS feed link tag
    let rss_search = r#"feeds/videos.xml?channel_id="#;
    if let Some(pos) = html.find(rss_search) {
        let start = pos + rss_search.len();
        let end = html[start..].find('"').map(|p| start + p).unwrap_or(html.len());
        let id = &html[start..end];
        if id.starts_with("UC") && id.len() >= 22 {
            return Ok(id.to_string());
        }
    }

    // Strategy 2: Look for "channelId":"UC..." in initial data scripts
    let channel_id_search = r#""channelId":""#;
    if let Some(pos) = html.find(channel_id_search) {
        let start = pos + channel_id_search.len();
        let end = html[start..].find('"').map(|p| start + p).unwrap_or(html.len());
        let id = &html[start..end];
        if id.starts_with("UC") && id.len() >= 22 {
            return Ok(id.to_string());
        }
    }

    Err("Could not find channel ID in YouTube page".to_string())
}
