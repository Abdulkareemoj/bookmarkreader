import type {
	IAuthAgent,
	AuthProvider,
	AuthResult,
	AuthUserInfo,
} from "@packages/agents";

const TOKEN_KEY = "google_drive_tokens";
const CODE_VERIFIER_KEY = "oauth_code_verifier";
const REDIRECT_AFTER_KEY = "oauth_redirect_after";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

interface StoredTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
	email: string | null;
	name: string | null;
}

function getClientId(): string {
	return import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? "";
}

function getClientSecret(): string {
	return import.meta.env.VITE_GOOGLE_WEB_SECRET_ID ?? "";
}

function getRedirectUri(): string {
	return `${window.location.origin}/auth/callback`;
}

function base64UrlEncode(str: string): string {
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function loadTokens(): StoredTokens | null {
	try {
		const raw = localStorage.getItem(TOKEN_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function saveTokens(tokens: StoredTokens): void {
	localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

function clearTokens(): void {
	localStorage.removeItem(TOKEN_KEY);
}

async function generateCodeVerifier(): Promise<string> {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64UrlEncode(String.fromCharCode(...array));
}

async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return base64UrlEncode(String.fromCharCode(...new Uint8Array(digest)));
}

async function refreshAccessToken(
	refreshToken: string,
): Promise<string | null> {
	const clientId = getClientId();
	const clientSecret = getClientSecret();

	try {
		const body = new URLSearchParams({
			client_id: clientId,
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		});
		if (clientSecret) body.append("client_secret", clientSecret);

		const res = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});
		if (!res.ok) return null;

		const data = await res.json();
		const current = loadTokens();
		if (current) {
			current.accessToken = data.access_token;
			current.expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
			saveTokens(current);
		}
		return data.access_token;
	} catch {
		return null;
	}
}

async function getAccessTokenInner(): Promise<string | null> {
	const tokens = loadTokens();
	if (!tokens?.accessToken) return null;
	if (Date.now() >= tokens.expiresAt - 60_000) {
		if (tokens.refreshToken) {
			return refreshAccessToken(tokens.refreshToken);
		}
		return null;
	}
	return tokens.accessToken;
}

async function getUserInfoInner(): Promise<AuthUserInfo | null> {
	const tokens = loadTokens();
	if (tokens?.email) {
		return { email: tokens.email, name: tokens.name ?? undefined };
	}
	const token = await getAccessTokenInner();
	if (!token) return null;

	try {
		const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return null;
		const data = await res.json();
		if (data.email) {
			const current = loadTokens();
			if (current) {
				current.email = data.email;
				current.name = data.name ?? null;
				saveTokens(current);
			}
		}
		return {
			email: data.email ?? "",
			name: data.name ?? undefined,
			picture: data.picture ?? undefined,
		};
	} catch {
		return null;
	}
}

export function createWebAuthAgent(): IAuthAgent {
	return {
		signIn: async (provider: AuthProvider): Promise<AuthResult> => {
			if (provider !== "gdrive") {
				return {
					success: false,
					provider,
					accessToken: null,
					error: `Provider ${provider} not supported on web`,
				};
			}

			const clientId = getClientId();
			if (!clientId) {
				return {
					success: false,
					provider,
					accessToken: null,
					error:
						"Google Client ID not configured. Set VITE_GOOGLE_WEB_CLIENT_ID in .env",
				};
			}

			const codeVerifier = await generateCodeVerifier();
			const codeChallenge = await generateCodeChallenge(codeVerifier);

			sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
			sessionStorage.setItem(REDIRECT_AFTER_KEY, window.location.href);

			const redirectUri = getRedirectUri();
			const scopeStr = SCOPES.join(" ");

			const authUrl =
				`https://accounts.google.com/o/oauth2/v2/auth?` +
				`client_id=${encodeURIComponent(clientId)}` +
				`&redirect_uri=${encodeURIComponent(redirectUri)}` +
				`&response_type=code` +
				`&scope=${encodeURIComponent(scopeStr)}` +
				`&access_type=offline` +
				`&prompt=consent` +
				`&code_challenge=${encodeURIComponent(codeChallenge)}` +
				`&code_challenge_method=S256`;

			window.location.href = authUrl;

			return { success: true, provider, accessToken: null };
		},

		signOut: async () => {
			clearTokens();
		},

		getAccessToken: getAccessTokenInner,

		isSignedIn: async (): Promise<boolean> => {
			const tokens = loadTokens();
			return !!tokens?.accessToken;
		},

		getProvider: async (): Promise<AuthProvider> => {
			const tokens = loadTokens();
			return tokens?.accessToken ? "gdrive" : "none";
		},

		getUserInfo: getUserInfoInner,
	};
}
