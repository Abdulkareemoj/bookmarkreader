import type {
	IAuthAgent,
	AuthProvider,
	AuthResult,
	AuthUserInfo,
} from "@packages/agents";

import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import {
	makeRedirectUri,
	exchangeCodeAsync,
	revokeAsync,
	type TokenResponseConfig,
} from "expo-auth-session";

// ─── Google OAuth Discovery ──────────────────────────────────────────────────

const GOOGLE_DISCOVERY = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
	revocationEndpoint: "https://oauth2.googleapis.com/revoke",
	userInfoEndpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
};

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const SCOPE_STRING = SCOPES.join(" ");

// ─── Secure Store Keys ───────────────────────────────────────────────────────

const KEYS = {
	accessToken: "gdrive_access_token",
	refreshToken: "gdrive_refresh_token",
	expiresAt: "gdrive_token_expires_at",
	userEmail: "gdrive_user_email",
	userName: "gdrive_user_name",
	authProvider: "auth_provider",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateCodeVerifier(): Promise<string> {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
	const bytes = await Crypto.getRandomBytesAsync(64);
	let result = "";
	for (const byte of bytes) {
		result += chars[byte % chars.length];
	}
	return result;
}

async function generateCodeChallenge(
	verifier: string,
): Promise<string> {
	const hashBase64 = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		verifier,
		{ encoding: Crypto.CryptoEncoding.BASE64 },
	);
	return hashBase64
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

// ─── Token Persistence ────────────────────────────────────────────────────────

async function storeTokens(config: TokenResponseConfig) {
	await Promise.all([
		SecureStore.setItemAsync(KEYS.accessToken, config.accessToken),
		SecureStore.setItemAsync(
			KEYS.refreshToken,
			config.refreshToken ?? "",
		),
		SecureStore.setItemAsync(
			KEYS.expiresAt,
			String(config.expiresIn ? Date.now() + config.expiresIn * 1000 : 0),
		),
	]);
}

async function clearTokens() {
	await Promise.all(
		Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k).catch(() => {})),
	);
}

async function getStoredAccessToken(): Promise<string | null> {
	return SecureStore.getItemAsync(KEYS.accessToken);
}

async function getStoredRefreshToken(): Promise<string | null> {
	return SecureStore.getItemAsync(KEYS.refreshToken);
}

async function getTokenExpiry(): Promise<number> {
	const val = await SecureStore.getItemAsync(KEYS.expiresAt);
	return val ? Number(val) : 0;
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

async function refreshAccessToken(
	clientId: string,
): Promise<TokenResponseConfig | null> {
	const refreshToken = await getStoredRefreshToken();
	if (!refreshToken) return null;

	try {
		const response = await fetch(GOOGLE_DISCOVERY.tokenEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: clientId,
				refresh_token: refreshToken,
				grant_type: "refresh_token",
			}),
		});

		if (!response.ok) return null;

		const data = await response.json();
		const config: TokenResponseConfig = {
			accessToken: data.access_token,
			refreshToken: refreshToken,
			expiresIn: data.expires_in ?? 3600,
		};
		await storeTokens(config);
		return config;
	} catch {
		return null;
	}
}

// ─── Auth Agent Factory ───────────────────────────────────────────────────────

export function createMobileAuthAgent(clientId: string): IAuthAgent {
	const redirectUri = makeRedirectUri({
		scheme: "minimal",
		path: "oauth2redirect/google",
	});

	const getValidAccessToken = async (): Promise<string | null> => {
		const token = await getStoredAccessToken();
		if (!token) return null;

		const expiry = await getTokenExpiry();
		if (Date.now() < expiry) return token;

		// Token expired, try refresh
		const refreshed = await refreshAccessToken(clientId);
		return refreshed?.accessToken ?? null;
	};

	const exchangeCodeForToken = async (
		code: string,
		codeVerifier: string,
	): Promise<TokenResponseConfig | null> => {
		try {
			const response = await exchangeCodeAsync(
				{
					code,
					clientId,
					redirectUri,
					extraParams: {
						code_verifier: codeVerifier,
					},
				},
				GOOGLE_DISCOVERY,
			);
			return response;
		} catch (e) {
			console.error("[auth] Token exchange failed:", e);
			return null;
		}
	};

	const fetchUserInfo = async (
		accessToken: string,
	): Promise<AuthUserInfo | null> => {
		try {
			const res = await fetch(GOOGLE_DISCOVERY.userInfoEndpoint, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!res.ok) return null;
			const data = await res.json();
			return {
				email: data.email ?? "",
				name: data.name ?? undefined,
				picture: data.picture ?? undefined,
			};
		} catch {
			return null;
		}
	};

	return {
		signIn: async (provider: AuthProvider): Promise<AuthResult> => {
			if (provider !== "gdrive") {
				return {
					success: false,
					provider,
					accessToken: null,
					error: `Provider ${provider} not supported on mobile yet`,
				};
			}

			if (!clientId) {
				return {
					success: false,
					provider,
					accessToken: null,
					error:
						"Google Client ID not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in .env",
				};
			}

			try {
				const codeVerifier = await generateCodeVerifier();
				const codeChallenge = await generateCodeChallenge(codeVerifier);

				const authUrl = `${GOOGLE_DISCOVERY.authorizationEndpoint}?${new URLSearchParams(
					{
						client_id: clientId,
						redirect_uri: redirectUri,
						response_type: "code",
						scope: SCOPE_STRING,
						code_challenge: codeChallenge,
						code_challenge_method: "S256",
						access_type: "offline",
						prompt: "consent",
					},
				)}`;

				const result = await WebBrowser.openAuthSessionAsync(
					authUrl,
					redirectUri,
				);

				if (result.type !== "success") {
					return {
						success: false,
						provider,
						accessToken: null,
						error:
							result.type === "cancel"
								? "Sign in cancelled"
								: "Sign in failed",
					};
				}

				// Extract auth code from redirect URL
				const params = new URLSearchParams(
					result.url.split("#")[0].split("?")[1] ?? "",
				);
				const code = params.get("code");
				if (!code) {
					return {
						success: false,
						provider,
						accessToken: null,
						error: "No authorization code received",
					};
				}

				// Exchange code for tokens
				const tokenConfig = await exchangeCodeForToken(code, codeVerifier);
				if (!tokenConfig?.accessToken) {
					return {
						success: false,
						provider,
						accessToken: null,
						error: "Failed to exchange authorization code",
					};
				}

				await storeTokens(tokenConfig);

				// Fetch user info
				const userInfo = await fetchUserInfo(tokenConfig.accessToken);
				if (userInfo?.email) {
					await SecureStore.setItemAsync(KEYS.userEmail, userInfo.email);
					if (userInfo.name)
						await SecureStore.setItemAsync(KEYS.userName, userInfo.name);
				}

				await SecureStore.setItemAsync(KEYS.authProvider, provider);

				return {
					success: true,
					provider,
					accessToken: tokenConfig.accessToken,
					refreshToken: tokenConfig.refreshToken ?? undefined,
				};
			} catch (e) {
				return {
					success: false,
					provider,
					accessToken: null,
					error: `OAuth error: ${(e as Error).message}`,
				};
			}
		},

		signOut: async () => {
			const token = await getStoredAccessToken();
			if (token) {
				try {
					await revokeAsync(
						{ token, clientId },
						GOOGLE_DISCOVERY,
					);
				} catch {
					// Best-effort revoke
				}
			}
			await clearTokens();
		},

		getAccessToken: async () => getValidAccessToken(),

		isSignedIn: async () => {
			const token = await getStoredAccessToken();
			return token !== null;
		},

		getProvider: async (): Promise<AuthProvider> => {
			const val = await SecureStore.getItemAsync(KEYS.authProvider);
			return (val as AuthProvider) ?? "none";
		},

		getUserInfo: async (): Promise<AuthUserInfo | null> => {
			const email = await SecureStore.getItemAsync(KEYS.userEmail);
			if (!email) return null;
			const name = await SecureStore.getItemAsync(KEYS.userName);
			return { email, name: name ?? undefined };
		},
	};
}
