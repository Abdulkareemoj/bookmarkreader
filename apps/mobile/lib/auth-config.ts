// OAuth configuration for cloud storage access.
// To use Google Drive sync:
// 1. Create a project at https://console.cloud.google.com
// 2. Enable the Google Drive API
// 3. Create OAuth 2.0 credentials (Web + Android)
// 4. Set the Android package name to match app.json
// 5. Set the Android SHA-1 fingerprint in Google Cloud Console
// 6. Copy the client IDs here (or set env vars)

import Constants from "expo-constants";

const WEB_CLIENT_ID =
	process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

const ANDROID_CLIENT_ID =
	process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

export const GOOGLE_OAUTH_CONFIG = {
	webClientId: WEB_CLIENT_ID,
	androidClientId: ANDROID_CLIENT_ID,
	// For iOS, you'd add an iosClientId here too

	// Use android client id on Android, web on everything else
	get clientId() {
		if (Constants.appOwnership === "expo" || Constants.platform?.android) {
			return this.androidClientId || this.webClientId;
		}
		return this.webClientId;
	},

	scopes: ["https://www.googleapis.com/auth/drive.file"],
	redirectUri: undefined as string | undefined, // set by makeRedirectUri()
};

export const DRIVE_SYNC_FILENAME = "bookmark-reader-sync.json";
export const DRIVE_SYNC_MIME = "application/json";
