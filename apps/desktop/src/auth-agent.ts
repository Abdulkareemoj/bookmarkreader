import type {
	IAuthAgent,
	AuthProvider,
	AuthResult,
	AuthUserInfo,
} from "@packages/agents";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { writeTextFile, readTextFile, mkdir } from "@tauri-apps/plugin-fs";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

interface StoredTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
	email: string | null;
	name: string | null;
}

interface OAuthFlowResult {
	access_token: string;
	refresh_token: string | null;
	expires_in: number;
}

let cachedTokens: StoredTokens | null = null;
let tokensPath: string | null = null;

async function ensureDir(): Promise<void> {
	const dir = await appDataDir();
	try {
		await mkdir(dir, { recursive: true });
	} catch {
		// dir may already exist
	}
}

async function getTokensPath(): Promise<string> {
	if (tokensPath) return tokensPath;
	const dir = await appDataDir();
	await ensureDir();
	tokensPath = `${dir}/oauth-tokens.json`;
	return tokensPath;
}

async function loadTokens(): Promise<StoredTokens | null> {
	if (cachedTokens) return cachedTokens;
	try {
		const path = await getTokensPath();
		const raw = await readTextFile(path);
		cachedTokens = JSON.parse(raw) as StoredTokens;
		return cachedTokens;
	} catch {
		return null;
	}
}

async function saveTokens(tokens: StoredTokens): Promise<void> {
	cachedTokens = tokens;
	const path = await getTokensPath();
	await writeTextFile(path, JSON.stringify(tokens, null, 2));
}

async function clearTokens(): Promise<void> {
	cachedTokens = null;
	try {
		const path = await getTokensPath();
		await writeTextFile(path, JSON.stringify({}));
	} catch {
		// Ignore — file might not exist
	}
}

function getClientId(): string {
	if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GOOGLE_DESKTOP_CLIENT_ID) {
		return import.meta.env.VITE_GOOGLE_DESKTOP_CLIENT_ID;
	}
	return "";
}

function getClientSecret(): string {
	if (typeof import.meta !== "undefined" && import.meta.env?.VITE_GOOGLE_DESKTOP_SECRET_ID) {
		return import.meta.env.VITE_GOOGLE_DESKTOP_SECRET_ID;
	}
	return "";
}

export function createDesktopAuthAgent(): IAuthAgent {
	const clientId = getClientId();

	const refreshAccessToken = async (
		refreshToken: string,
	): Promise<string | null> => {
		try {
			const res = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					client_id: clientId,
					refresh_token: refreshToken,
					grant_type: "refresh_token",
				}),
			});
			if (!res.ok) return null;
			const data = await res.json();
			const current = (await loadTokens())!;
			current.accessToken = data.access_token;
			current.expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
			await saveTokens(current);
			return data.access_token;
		} catch {
			return null;
		}
	};

	const getAccessToken = async (): Promise<string | null> => {
		const tokens = await loadTokens();
		if (!tokens?.accessToken) return null;
		if (Date.now() >= tokens.expiresAt - 60_000) {
			if (tokens.refreshToken) {
				return refreshAccessToken(tokens.refreshToken);
			}
			return null;
		}
		return tokens.accessToken;
	};

	const getUserInfo = async (): Promise<AuthUserInfo | null> => {
		const tokens = await loadTokens();
		if (tokens?.email) {
			return { email: tokens.email, name: tokens.name ?? undefined };
		}
		const token = await getAccessToken();
		if (!token) return null;
		try {
			const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) return null;
			const data = await res.json();
			if (data.email) {
				const current = await loadTokens();
				if (current) {
					current.email = data.email;
					current.name = data.name ?? null;
					await saveTokens(current);
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
	};

	return {
		signIn: async (provider: AuthProvider): Promise<AuthResult> => {
			if (provider !== "gdrive") {
				return {
					success: false,
					provider,
					accessToken: null,
					error: `Provider ${provider} not supported on desktop yet`,
				};
			}

			if (!clientId) {
				return {
					success: false,
					provider,
					accessToken: null,
					error:
						"Google Client ID not configured. Set VITE_GOOGLE_DESKTOP_CLIENT_ID in .env",
				};
			}

			try {
				const result: OAuthFlowResult = await invoke("start_oauth_flow", {
					clientId,
					clientSecret: getClientSecret(),
					scopes: SCOPES,
				});

				const tokens: StoredTokens = {
					accessToken: result.access_token,
					refreshToken: result.refresh_token ?? null,
					expiresAt: Date.now() + result.expires_in * 1000,
					email: null,
					name: null,
				};

				await saveTokens(tokens);

				// Fetch user info in background
				getUserInfo().catch(() => {});

				return {
					success: true,
					provider,
					accessToken: result.access_token,
					refreshToken: result.refresh_token ?? undefined,
				};
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				return {
					success: false,
					provider,
					accessToken: null,
					error: `OAuth failed: ${msg}`,
				};
			}
		},

		signOut: async () => {
			await clearTokens();
		},

		getAccessToken,

		isSignedIn: async (): Promise<boolean> => {
			const tokens = await loadTokens();
			return !!tokens?.accessToken;
		},

		getProvider: async (): Promise<AuthProvider> => {
			const tokens = await loadTokens();
			return tokens?.accessToken ? "gdrive" : "none";
		},

		getUserInfo,
	};
}
