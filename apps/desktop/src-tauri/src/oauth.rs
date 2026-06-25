use serde::{Deserialize, Serialize};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::Duration;

#[derive(Serialize)]
pub struct OAuthTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: u64,
}

#[derive(Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: u64,
    token_type: String,
}

fn redirect_html() -> &'static str {
    r#"<html>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0;background:#f5f5f5">
<div style="text-align:center;padding:2rem;background:white;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.1)">
<h1 style="color:#22c55e">✅ Signed in</h1>
<p style="color:#666">Google Drive connected. You can close this tab.</p>
</div>
</body>
</html>"#
}

fn extract_query_param(query: &str, name: &str) -> Option<String> {
    for pair in query.split('&') {
        let mut parts = pair.splitn(2, '=');
        let key = parts.next()?;
        let value = parts.next().unwrap_or("");
        if key == name {
            return Some(urlencoding::decode(value).ok()?.to_string());
        }
    }
    None
}

fn exchange_code(code: &str, client_id: &str, redirect_uri: &str) -> Result<OAuthTokens, String> {
    let body = format!(
        "code={}&client_id={}&redirect_uri={}&grant_type=authorization_code",
        urlencoding::encode(code),
        urlencoding::encode(client_id),
        urlencoding::encode(redirect_uri),
    );

    let request = format!(
        "POST /token HTTP/1.1\r\n\
		Host: oauth2.googleapis.com\r\n\
		Content-Type: application/x-www-form-urlencoded\r\n\
		Content-Length: {}\r\n\
		Connection: close\r\n\
		\r\n\
		{}",
        body.len(),
        body
    );

    let mut stream = TcpStream::connect("oauth2.googleapis.com:443")
        .map_err(|e| format!("Failed to connect to Google: {}", e))?;

    // Wrap in TLS
    let mut tls = native_tls::TlsConnector::new()
        .map_err(|e| format!("Failed to create TLS connector: {}", e))?;
    let mut tls_stream = tls
        .connect("oauth2.googleapis.com", stream)
        .map_err(|e| format!("TLS handshake failed: {}", e))?;

    tls_stream
        .write_all(request.as_bytes())
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let mut response = String::new();
    tls_stream
        .read_to_string(&mut response)
        .map_err(|e| format!("Failed to read response: {}", e))?;

    // Parse HTTP response body
    let body = response.split("\r\n\r\n").nth(1).unwrap_or("");

    let token: GoogleTokenResponse =
        serde_json::from_str(body).map_err(|e| format!("Failed to parse token response: {}", e))?;

    Ok(OAuthTokens {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_in: token.expires_in,
    })
}

#[tauri::command]
pub fn start_oauth_flow(client_id: String, scopes: Vec<String>) -> Result<OAuthTokens, String> {
    let redirect_uri = "http://127.0.0.1:9876/callback";
    let scope_str = scopes.join(" ");

    // Build Google auth URL — encode each value individually
    let auth_url = format!(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope={}&access_type=offline&prompt=consent",
		urlencoding::encode(&client_id),
		urlencoding::encode(redirect_uri),
		urlencoding::encode(&scope_str),
    );

    // Start localhost server
    let listener = TcpListener::bind("127.0.0.1:9876")
        .map_err(|e| format!("Failed to start local server on port 9876: {}", e))?;

    // Open browser
    open::that(&auth_url).map_err(|e| format!("Failed to open browser: {}", e))?;

    // Accept one connection (5-minute timeout)
    listener.set_nonblocking(true).ok();
    let (mut stream, _) = loop {
        match listener.accept() {
            Ok(conn) => break conn,
            Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                std::thread::sleep(Duration::from_millis(100));
            }
            Err(_) => return Err("Failed to accept connection".to_string()),
        }
    };
    stream
        .set_read_timeout(Some(Duration::from_secs(300)))
        .ok();

    let mut buffer = [0; 8192];
    let bytes_read = stream
        .read(&mut buffer)
        .map_err(|e| format!("Failed to read request: {}", e))?;

    let request = String::from_utf8_lossy(&buffer[..bytes_read]);

    // Extract the URL path with query params from the HTTP request
    // e.g. GET /callback?code=xxx&scope=yyy HTTP/1.1
    let request_line = request.lines().next().unwrap_or("");
    let path = request_line.split_whitespace().nth(1).unwrap_or("");

    // Send response HTML
    let html = redirect_html();
    let response = format!(
		"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
		html.len(),
		html
	);
    stream.write_all(response.as_bytes()).ok();

    // Extract auth code from path
    // path is /callback?code=xxx&scope=yyy
    let query = path.split('?').nth(1).unwrap_or("");
    let code = extract_query_param(query, "code")
        .ok_or_else(|| "No authorization code in callback".to_string())?;

    // Exchange code for tokens
    exchange_code(&code, &client_id, redirect_uri)
}
